class Card < ActiveRecord::Base

  acts_as_taggable

  has_many :votes, :foreign_key => :votable_id
  has_many :favorites

  validates_uniqueness_of :remote_id, :image_link_original

  # Imgur specific
  before_create :resize_image_links
  def resize_image_links
    return unless remote_provider == 'imgur'
    type = RemoteResource.content_type(content_type)
    # tiny 90x90
    self.image_link_tiny = "http://i.imgur.com/#{remote_id}s.#{type}"
    # thumnail 160x160 
    self.image_link_thumbnail = "http://i.imgur.com/#{remote_id}t.#{type}"
    # medium 320x320 
    self.image_link_medium = "http://i.imgur.com/#{remote_id}m.#{type}"
    # large 640x640
    self.image_link_large = "http://i.imgur.com/#{remote_id}l.#{type}"
  end

  def active_model_serializer
    CardSerializer
  end

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
    elsif tag == 'trending'
      has_voted = user.votes.pluck(:votable_id) 
      cards = Card.where('id not in (?) and viral', has_voted).limit(n).order('created_at DESC')
      cards
    else
      has_voted = user.votes.pluck(:votable_id) 
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
      has_voted = user.votes.pluck(:votable_id) 
      Card.where('id not in (?)', has_voted).limit(n).order('created_at DESC')
    end
  end

  def cache_update_available?
    c = Card.last
    c.try(:created_at) < 20.minutes.ago ? true : false
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
        image_link_original: obj['link'],
        viral: false,
        title: obj['title'],
        description: obj['description'],
        content_type: obj['type'],
        animated: obj['animated'],
        width: obj['width'],
        height: obj['height'],
        size: obj['size'],
        remote_views: obj['views'],
        remote_score: obj['score'],
        remote_up_votes: obj['up'],
        remote_down_votes: obj['up'],
        section: obj['section'],
        delete_hash: obj['deletehash']
      })
      Rails.logger.info "Created #{card.inspect}"
    end

  end

  def self.populate_trending!
    response = RemoteResource.get
    fresh_list = response.parsed_response["data"]
    fresh_list.each do |obj|
      if obj['is_album'].to_s == 'false' and obj['nsfw'].to_s == 'false'
        Card.create({
          remote_id: obj['id'],
          remote_provider: 'imgur',
          remote_created_at: Time.at(obj['datatime'].to_i) || Time.now,
          image_link_original: obj['link'],
          viral: true,
          title: obj['title'],
          description: obj['description'],
          content_type: obj['type'],
          animated: obj['animated'],
          width: obj['width'],
          height: obj['height'],
          size: obj['size'],
          remote_views: obj['views'],
          remote_score: obj['score'],
          remote_up_votes: obj['up'],
          remote_down_votes: obj['up'],
          section: obj['section'],
          delete_hash: obj['deletehash']
        })
      end
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
