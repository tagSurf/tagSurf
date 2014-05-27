class Card < ActiveRecord::Base

  # Setup Redis-objects on Cards
  include Redis::Objects
  counter :up_votes

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
    # Huge 1024x1024 
    self.image_link_huge = "http://i.imgur.com/#{remote_id}h.#{type}"
  end

  def active_model_serializer
    CardSerializer
  end

  def tagged_as
    votes.map(&:vote_tag).uniq
  end

  def card_tag_info(tag)
    trend = [*1..10].sample.odd? ? 'up' : 'down' 
    data = {total_votes: nil, down_votes: nil, up_votes: nil, score: nil, is_trending: false, trend: nil}
    # Doing count lookups is faster than array actions, but refactor is needed.
    data[:total_votes]  = Vote.where(votable_id: id, vote_tag: tag).count
    data[:down_votes]   = Vote.where(votable_id: id, vote_tag: tag, vote_flag: false).count
    data[:up_votes]     = Vote.where(votable_id: id, vote_tag: tag, vote_flag: true).count
    data[:is_trending]  = false
    data[:score]        = (data[:total_votes] - data[:down_votes]) 
    data[:trend]        = trend 
    data 
  end

  def scale_dimensions(max)
    return {} if width.blank? || height.blank?

    @height = height.to_f
    @width  = width.to_f

    if @width > @height
      if @width > max
        ratio = max / @width
        scaled_height = height * ratio
        scaled_width = width * ratio
      else 
        scaled_width = width
        scaled_height = height
      end
    else 
      if @height > max
        ratio = max / @height
        scaled_height = height * ratio
        scaled_width = width * ratio
      else 
        scaled_width = width
        scaled_height = height
      end
    end

    {:width => scaled_width.to_i, :height => scaled_height.to_i}
  end

  def create_tagging
    return if section.nil?
    self.tag_list = self.section
    self.save
  end

  # Gather the next set of cards for feeds 
  # The brains of tagSurf feeds 
  def self.next(user, tag, n=20)
    if Tag.blacklisted?(tag)
      []
    elsif user.nil?
      # Cards available for non-authed preview
      # Not implemented
      []
    else
      @cards = Card.all
      has_voted_ids = user.votes.pluck(:votable_id) 

      if tag == 'trending'
        staffpick_ids = @cards.tagged_with('StaffPicks').pluck(:id)
        viral_ids = @cards.where(viral: true).pluck(:id)

        # Remove media which the user has voted on
        staffpick_ids = staffpick_ids - has_voted_ids

        # Avoid the extra query if no staffpicks left
        # Reserving optimization for the move to Redis objects
        if staffpick_ids.present?
          if staffpick_ids.length < 20
            trending_limit = n - staffpick_ids.length
            additional_media = Card.where('id not in (?) and id in (?)', has_voted_ids, viral_ids).limit(trending_limit).order('ts_score DESC NULLS LAST').map(&:id)
            media_ids = staffpick_ids + additional_media

            # Custom sort order for collections
            # TODO Move to Activerecord extension
            sort_order = media_ids.collect{|id| "id = #{id} desc"}.join(',')
            @cards =  @cards.where('id in (?)', media_ids).limit(n).order(sort_order)
          else
            @cards =  @cards.where('id in (?)', staffpick_ids).limit(n).order('ts_score DESC NULLS LAST')
          end
        else
          @cards = @cards.where('id not in (?) and viral', has_voted_ids).limit(n).order('ts_score DESC NULLS LAST')
        end
      else
        @cards = Card.where('cards.id not in (?)', has_voted_ids).tagged_with(tag, :wild => true).limit(n).order('ts_score DESC NULLS LAST')
        if @cards.length < 10
          RequestTaggedMedia.perform_async(tag)
        end
      end
      @cards
    end
  end

  def self.populate_tag(tag) 
    return if Tag.blacklisted?(tag)
    response = RemoteResource.tagged_feed(tag)

    if response.nil? or response.parsed_response.nil?
      raise "Failed to fetch with #{tag}, response:#{response}"
    end

    tagged = response.parsed_response["data"]

    # Create tag if not already in the system
    unless tag = Tag.where('name ilike ?', tag).first
      tag = Tag.create(name: tag)
    end

    if tagged
      tagged.each do |obj|
        next if obj["nsfw"].to_s == 'true'
        next if obj['is_album'].to_s == 'true'
        card = Card.create({
          remote_id: obj['id'],
          remote_provider: 'imgur',
          remote_created_at: obj['datatime'],
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
          ts_score: (obj['score'] + (Time.new.to_i - 1000000000)),
          remote_up_votes: obj['ups'],
          remote_down_votes: obj['downs'],
          section: obj['section'],
          delete_hash: obj['deletehash']
        })
        card.tag_list.add(card.section)
        card.save
      end
    else
      tag.update_column("fetch_more_content", true)
    end
  end

  def self.populate_trending!
    response = RemoteResource.viral_feed
    fresh_list = response.parsed_response["data"]
    fresh_list.each do |obj|
      if obj['is_album'].to_s == 'false' and obj['nsfw'].to_s == 'false'
        card = Card.create({
          remote_id: obj['id'],
          remote_provider: 'imgur',
          remote_created_at: obj['datatime'],
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
          ts_score: (obj['score'] + (Time.new.to_i - 1000000000)),
          remote_up_votes: obj['ups'],
          remote_down_votes: obj['downs'],
          section: obj['section'] || "imgurhot",
          delete_hash: obj['deletehash']
        })

        card.tag_list.add(card.section, 'trending')
        card.save
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
