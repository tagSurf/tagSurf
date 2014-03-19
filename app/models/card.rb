class Card < ActiveRecord::Base

  acts_as_votable
  acts_as_taggable

  def active_model_serializer
    CardSerializer
  end

  validates_uniqueness_of :remote_id, :link

  def create_tagging
    return if section.nil?
    self.tag_list = self.section
    self.save
  end

  # Display the next card to the user for voting
  def self.next(user, tag, n=10)
    return unless user
    if user.votes.size < 1
      Card.last(n)
    elsif tag == 'hot'
      has_voted = user.votes.pluck(:id) 
      cards = Card.where('id not in (?)', has_voted).limit(n).order('created_at DESC')
      cards
    else
      has_voted = user.votes.pluck(:id) 
      cards = Card.where('cards.id not in (?)', has_voted).tagged_with([tag], :any => true).limit(n).order('created_at DESC')
      if cards.length < 10
        self.populate_tag(tag)
      end
      cards
    end
  end

  def Card.next_tagged(user, tag, n=10)
    return unless user
    if user.votes.size < 1
      Card.first(n)
    else
      has_voted = user.votes.pluck(:id) 
      Card.where('id not in (?)', has_voted).limit(n).order('created_at DESC')
    end
  end

  def self.populate_tag(tag) 
    response = RemoteResource.get_tag(tag)
    tagged = response.parsed_response["data"]
    tagged.each do |obj|
      next if obj["nsfw"].to_s == 'true'
      next if obj['is_album'].to_s == 'true'
      card = Card.create({
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
        section: tag,
        delete_hash: obj['deletehash']
      })
      Rails.logger.info "Created #{card.inspect}"
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
