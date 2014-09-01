class Media < ActiveRecord::Base

  include Redis::Objects
  counter :up_votes
  counter :down_votes

  acts_as_taggable

  has_many :votes, :foreign_key => :votable_id
  has_many :favorites

  validates_uniqueness_of :remote_id, :image_link_original

  default_scope { where(ts_type: 'content') }
  default_scope { where(reported: false) }

  scope :nsfw, ->(boolean) { where("nsfw = ?", boolean) }

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
    MediaSerializer
  end

  def tagged_as
    votes.map(&:vote_tag).uniq
  end

  def media_tag_info(tag)
    trend = [*1..10].sample.odd? ? 'up' : 'down' 
    data = {total_votes: nil, down_votes: nil, up_votes: nil, score: nil, is_trending: false, trend: nil}
    #data[:total_votes]  = Vote.where(votable_id: id, vote_tag: tag).count
    #data[:down_votes]   = Vote.where(votable_id: id, vote_tag: tag, vote_flag: false).count
    #data[:up_votes]     = Vote.where(votable_id: id, vote_tag: tag, vote_flag: true).count
    #data[:score]        = (data[:total_votes] - data[:down_votes]) 
    data[:is_trending]  = false
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

  # Gather the next set of media for feeds 
  # The brains of tagSurf feeds 
  # TODO evaluate for efficiency
  def self.next(user, tag, options = {})
    offset = options[:offset].try(:to_i) || 0 
    n = options[:limit].try(:to_i) || 20 
    id = options[:id].to_i
       
    if user.try(:safe_mode) 
      return [] if Tag.blacklisted?(tag)
    end

    unless user
      return [] if Tag.blacklisted?(tag)
    end

    @media = Media.all

    # Media available for non-authed preview
    # cache versus non, not showing improvement
    if user.nil?
      if tag == 'trending'
        @media = @media.where(viral: true, nsfw: false).limit(n).offset(offset).order('ts_score DESC NULLS LAST')
      else
        @media = @media.where(nsfw: false).tagged_with(tag, :wild => true).limit(n).offset(offset).order('ts_score DESC NULLS LAST')  
        if @media.length < 10
          RequestTaggedMedia.perform_async(tag)
        end
      end

    # Authenticated users
    else
      has_voted_ids = MediaCache.vote_history
      if tag == 'trending'

        staffpick_ids = MediaCache.staff_picks
        viral_ids = MediaCache.viral_media_ids

        # Remove media which the user has voted on
        staffpick_ids = staffpick_ids - has_voted_ids

        # Avoid the extra query if no staffpicks left
        # Reserving optimization for the move to Redis objects
        if staffpick_ids.present?
          if staffpick_ids.length < 20
            trending_limit = n - staffpick_ids.length
            additional_media = Media.where('id not in (?) and id in (?)', has_voted_ids, viral_ids).limit(trending_limit).order('ts_score DESC NULLS LAST').map(&:id)
            media_ids = staffpick_ids + additional_media

            # Custom sort order for collections
            # TODO candidate for Activerecord extension
            sort_order = media_ids.collect{|id| "id = #{id} desc"}.join(',')
            @media =  @media.where('id in (?)', media_ids).limit(n).order(sort_order)
          else
            @media =  @media.where('id in (?)', staffpick_ids).limit(n).order('ts_score DESC NULLS LAST')
          end
        else
          if user.safe_mode? 
            @media = @media.where('id not in (?) and viral and not nsfw', has_voted_ids).limit(n).order('ts_score DESC NULLS LAST')
          else
            @media = @media.where('id not in (?) and viral', has_voted_ids).limit(n).order('ts_score DESC NULLS LAST')
          end
        end
      else
        if user.safe_mode?
          @media = Media.where('media.id not in (?) and not nsfw', has_voted_ids).tagged_with(tag, :wild => true).limit(n).order('ts_score DESC NULLS LAST')
        else
          @media = Media.where('media.id not in (?)', has_voted_ids).tagged_with(tag, :wild => true).limit(n).order('ts_score DESC NULLS LAST')
        end
    
        if @media.length < 10
          RequestTaggedMedia.perform_async(tag)
        end
      end
    end

    if id.present? and offset < 1
      @media = Media.where(id: id) + @media
      @media = @media.uniq_by(&:id)
    end

    # Embedds login card every third card
    if user.nil?
      @login_card = Media.unscoped.where(ts_type: 'login').limit(1)
      # creates an empty relation
      @relation = Media.where(id: nil)
      @media.each_slice(4) do |media|
        @relation << media + @login_card
      end
      @media = @relation.flatten!
    end



    @media
  end

  def self.populate_tag(tag_name) 
    response = RemoteResource.tagged_feed(tag_name)

    if response.nil? or response.parsed_response.nil?
      raise "Failed to fetch with #{tag_name}, response:#{response}"
    end

    tagged = response.parsed_response["data"]

    # Create tag if not already in the system
    unless tag = Tag.where('name ilike ?', tag_name).first
      tag = Tag.create(name: tag_name)
    end

    if tagged
      tagged.each do |obj|
        next if obj['is_album'].to_s == 'true'
        media = Media.create({
          remote_id: obj['id'],
          remote_provider: 'imgur',
          remote_created_at: obj['datatime'],
          image_link_original: obj['link'],
          viral: false,
          nsfw:  (obj["nsfw"] || false),
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

        if obj["nsfw"] == 'true'
          media.tag_list.add(media.section, 'NSFW')
        else
          media.tag_list.add(media.section)
        end

        media.save
      end
    else
      tag.update_column("fetch_more_content", true)
    end
  end

  def self.populate_trending!
    response = RemoteResource.viral_feed
    fresh_list = response.parsed_response["data"]
    fresh_list.each do |obj|
      if obj['is_album'].to_s == 'false'
        media = Media.create({
          remote_id: obj['id'],
          remote_provider: 'imgur',
          remote_created_at: obj['datatime'],
          image_link_original: obj['link'],
          viral: true,
          nsfw: (obj["nsfw"] || false),
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

        if obj['nsfw'] == 'true'
          media.tag_list.add(media.section, 'trending', 'NSFW')
        else
          media.tag_list.add(media.section, 'trending')
        end

        media.save
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
