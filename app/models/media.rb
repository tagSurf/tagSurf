class Media < ActiveRecord::Base

  include Redis::Objects
  counter :up_votes

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
    offset = options[:offset].nil? ? 0 : options[:offset].to_i
    n = options[:limit].nil? ?  20 : options[:limit].to_i
    id = options[:id].to_i
       
    if user.try(:safe_mode) 
      return [] if Tag.blacklisted?(tag)
    end

    unless user
      return [] if Tag.blacklisted?(tag)
    end

    @media = Media.all

    # Media available for non-authed preview
    if user.nil?
      if tag == 'trending'
        @media  = @media.where(viral: true, nsfw: false).limit(n).offset(offset).order('ts_score DESC NULLS LAST')
      else
        @media = @media.where(nsfw: false).tagged_with(tag, :wild => true).limit(n).offset(offset).order('ts_score DESC NULLS LAST')  
        if @media.length < 10
          RequestTaggedMedia.perform_async(tag)
        end
      end

    # Authenticated users
    else
      # Migrate has_voted_ids to Redis
      # unless has_voted_ids = user.voted_on.present? && user.voted_on.to_a
      # has_voted_ids = has_voted_ids.collect {|v| v.to_i } 
      # end
      has_voted_ids = user.votes.pluck(:votable_id)

      if tag == 'trending'
        # staffpick_ids = @media.tagged_with('StaffPicks').pluck(:id)
        viral_ids = @media.where(viral: true, nsfw: false).pluck(:id)

        # Remove media which the user has voted on
        # staffpick_ids = staffpick_ids - has_voted_ids

        # Avoid the extra query if no staffpicks left
        # Reserving optimization for the move to Redis objects
        # if staffpick_ids.present?
        #   if staffpick_ids.length < 20
        #     trending_limit = n - staffpick_ids.length
        #     additional_media = Media.where('id not in (?) and id in (?)', has_voted_ids, viral_ids).limit(trending_limit).order('ts_score DESC NULLS LAST').map(&:id)
        #     media_ids = staffpick_ids + additional_media

        #     # Custom sort order for collections
        #     # TODO candidate for Activerecord extension
        #     sort_order = media_ids.collect{|id| "id = #{id} desc"}.join(',')
        #     @media =  @media.where('id in (?)', media_ids).limit(n).order(sort_order)
        #   else
        #     @media =  @media.where('id in (?)', staffpick_ids).limit(n).order('ts_score DESC NULLS LAST')
        #   end
        # else
        if user.safe_mode? 
          if has_voted_ids.empty?
            @media = @media.where('viral and not nsfw').limit(n).order('ts_score DESC NULLS LAST')
          else 
            @media = @media.where('id not in (?) and viral and not nsfw', has_voted_ids).limit(n).order('ts_score DESC NULLS LAST')
          end
        else
          if has_voted_ids.empty?
            @media = @media.where('viral').limit(n).order('ts_score DESC NULLS LAST')
          else
            @media = @media.where('id not in (?) and viral', has_voted_ids).limit(n).order('ts_score DESC NULLS LAST')
          end
        end
        # end
      else
        if user.safe_mode?
          if has_voted_ids.empty?
            @media = Media.where('not nsfw').tagged_with(tag, :wild => true).limit(n).order('ts_score DESC NULLS LAST')
          else
            @media = Media.where('media.id not in (?) and not nsfw', has_voted_ids).tagged_with(tag, :wild => true).limit(n).order('ts_score DESC NULLS LAST')
          end
        else
          if has_voted_ids.empty?
            @media = Media.tagged_with(tag, :wild => true).limit(n).order('ts_score DESC NULLS LAST')
          else
            @media = Media.where('media.id not in (?)', has_voted_ids).tagged_with(tag, :wild => true).limit(n).order('ts_score DESC NULLS LAST')
          end
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
    updated = false
    CONFIG[:remote_providers].each do |provider|    
      begin
        if provider == 'imgur'
          response = RemoteResource.tagged_feed(tag_name, provider, nil, nil)

          if response.nil? or response.parsed_response.nil?
            raise "Failed to fetch imgur results for tag:##{tag_name}, response:#{response}"
          end

          tagged = response.parsed_response["data"]

          # Create tag if not already in the system
          unless tag = Tag.where('name ilike ?', tag_name).first
            tag = Tag.create(name: tag_name)
          end

          if tagged
            updated = true
            self.populate_imgur_tag(tagged)
          end

        elsif provider == 'urx'
          CONFIG[:urx_domains].each do |domain|
            @offset = 0
            while @offset < 10 do
              response = RemoteResource.tagged_feed(tag_name, provider, @offset, domain)

              if response.nil?
                raise "Failed to fetch URX results for tag:##{tag_name}, response:#{response}"
              end

              parsed = JSON.parse(response.body)
              tagged = parsed['result']

              if tagged.empty?
                break
              end

              # Create tag if not already in the system
              unless tag = Tag.where('name ilike ?', tag_name).first
                tag = Tag.create(name: tag_name)
              end

              if tagged
                updated = true
                self.populate_urx_tag(tagged, domain, tag_name)
              end
            @offset += 1
            end
          end
        else
          raise "Error unknown provider: #{provider}"
        end
      rescue => e
        puts "Something went wrong with Media.populate_tag: #{e}"
      end
    end
    if !updated 
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
          ts_score: (obj['score'] + (Time.new.to_i - 1300000000)),
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

  def init_vote_counter!
    up_votes = votes.where(vote_flag: true).count
    down_votes = votes.where(vote_flag: false).count
    self.up_votes.reset
    net_votes = up_votes - down_votes
    if net_votes > 0
      self.up_votes.increment(net_votes)
    elsif net_votes < 0
      self.up_votes.decrement(net_votes.abs)
    end
  end

  def self.populate_imgur_tag(objs)
    objs.each do |obj|
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
        ts_score: (obj['score'] + (Time.new.to_i - 1300000000)),
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
  end

  def self.populate_urx_tag(objs, domain, tag_name)
    if domain == 'buzzfeed.com'
      resp = Media.select(:remote_id).where(:remote_provider => 'urx/buzzfeed')
      starting_index = resp.nil? ? 1 : 
                        resp.sort_by { |x| -(x.remote_id[/\d+/].to_i) }.first.remote_id.split("#")[1].to_i + 1
      objs.each do |obj|
        media = Media.create({
          remote_id: "BUZZ##{starting_index}",
          remote_provider: 'urx/buzzfeed',
          remote_created_at: Time.now,
          image_link_original: obj['image'].is_a?(Array) ? obj['image'].first : obj['image'],
          image_link_large: obj['image'].is_a?(Array) ? obj['image'].first : obj['image'],
          image_link_huge: obj['image'].is_a?(Array) ? obj['image'].last : nil, 
          viral: false,
          nsfw:  false,
          title: obj['name'],
          description: obj['description'],
          content_type: obj['image'].is_a?(Array) ? 
                          "image/#{obj['image'].first.split('.').last.strip}" :
                           "image/#{obj['image'].split('.').last.strip}",
          animated: false,
          ts_score: (1000 + (Time.new.to_i - 1300000000)), #Give a small fixed bonus to lift it
          section: tag_name,
          web_link: obj['url'],
          deep_link: obj['potentialAction']['target']['urlTemplate'],
          deep_link_type: obj['potentialAction']['target']['@type'],
          deep_link_action: obj['potentialAction']['@type'],
          deep_link_desc: obj['potentialAction']['description'],
          deep_link_icon: obj['potentialAction']['image']
        })
        starting_index += 1
        media.tag_list.add('buzzfeed', 'urx', tag_name)
        
        media.save
      end
    else
      raise "Error unknown URX domain: #{domain}"
    end
  end 

end
