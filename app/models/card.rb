class Card < ActiveRecord::Base

  acts_as_votable
  acts_as_taggable

  validates_uniqueness_of :remote_id, :link

  def create_tagging
    return if section.nil?
    self.tag_list = self.section
    self.save
  end

  # Display the next card to the user for voting
  def self.next(user, tag=nil, n=10)
    return unless user
    if user.votes.size < 1
      Card.first(n)
    elsif tag == nil
      Card.where('id not in (?)', user.get_voted(Card).map(&:id)).limit(n).order('created_at DESC')
    else
      query = Card.where('id not in (?)', user.get_voted(Card).map(&:id))
      query = query.tagged_with([tag], :any => true)
      query = query.limit(n).order('created_at DESC')
      query
    end
  end

  def Card.next_tagged(user, tag, n=10)
    return unless user
    if user.votes.size < 1
      Card.first(n)
    else
      Card.where('id not in (?)', user.get_voted(Card).map(&:id)).limit(n).order('created_at DESC')
    end
  end

  def self.populate!
    response = RemoteResource.get
    fresh_list = response.parsed_response["data"]
    fresh_list.each do |obj|
      if obj['is_album'].to_s == 'false' and obj['nsfw'].to_s == 'false'
        Card.create({
          remote_id: obj['id'],
          remote_provider: 'imgur',
          remote_created_at: Time.at(obj['datatime'].to_i) || Time.now,
          link: obj['link'],
          title: obj['title'],
          description: obj['description'],
          content_type: obj['type'],
          animated: obj['animated'],
          width: obj['width'],
          height: obj['height'],
          size: obj['size'],
          imgur_views: obj['views'],
          section: obj['section'],
          delete_hash: obj['deletehash']
        })
      end
    end
  end

  def cache_update_available?
    c = Card.last
    c.try(:created_at) < 20.minutes.ago ? true : false
  end

  # Move to redis sidekiq
  # Expensive !!!
  #
  # The main method to update the imgur cards in the db
  # Excludes albums, TODO requery to populate albums
  def refresh!
    existing = Card.pluck(:remote_id, :created_at)
    if Rails.env.development? || existing.last[1] < 20.minutes.ago
      self.class.populate!
    end
  end

  # Mock IMGUR image model
  #  {
  #  "data": {
    #  "id":"vW5QZE1",
    #  "title":"I want to do good.",
    #  "description":null,
    #  "datetime":1389559678,
    #  "type":"image/png",
    #  "animated":false,
    #  "width":800,
    #  "height":600,
    #  "size":41511,
    #  "views":32947,
    #  "bandwidth":1367662917,
    #  "vote":null,
    #  "favorite":false,
    #  "nsfw":false,
    #  "section":null,
    #  "account_url":"ColorfulSpectrum",
    #  "link":"http://i.imgur.com/vW5QZE1.png",
    #  "ups":3663,
    #  "downs":241,
    #  "score":3438,
    #  "is_album":false
    #}
  #}

end
