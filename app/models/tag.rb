class Tag < ActiveRecord::Base

  include Redis::Objects
  sorted_set :safe_tag_feed, :global => true
  sorted_set :nsfw_tag_feed, :global => true
  
  has_many :votes

  validates_presence_of :name

  before_create :scrub_name

  # not implemented yet for all tags
  scope :safe_mode, ->(boolean) { where("blacklisted = ?", boolean) }

  def self.current_feed(user, scores=true)
    @obj = Tag.new

    if user and user.safe_mode == false

      if @obj.nsfw_tag_feed.members.any?
        if scores
          @obj.serialize(@obj.nsfw_tag_feed.members(withscores: true).reverse, true)
        else
          @obj.serialize(@obj.nsfw_tag_feed.members.reverse)
        end
      else
        tags = Tag.pluck(:name, :blacklisted)
        GenerateTagFeed.perform_async('nsfw')
        @obj.serialize(tags)
      end


    else

      if @obj.safe_tag_feed.members.any?
        if scores
          @obj.serialize(@obj.safe_tag_feed.members(withscores: true).reverse, true)
        else
          @obj.serialize(@obj.safe_tag_feed.members.reverse)
        end
      else
        tags = Tag.where(blacklisted: false).pluck(:name, :blacklisted)
        GenerateTagFeed.perform_async('safe')
        @obj.serialize(tags)
      end

    end
  end

  # When dealing with Redis objects we cannot use ActiveModel serializers
  # TODO Create module and include where needed
  def serialize(tag_name_array, withscores=false)
    results = {data: []}
    if withscores
      # Not doing anything different here yet.
      # Can adjust to key:value in json if needed
      tag_name_array.each do |tag_name|
        results[:data] << {name: tag_name[0], votes: tag_name[1]}
      end
    else
      tag_name_array.each do |tag_name|
        results[:data] << {name: tag_name}
      end
    end
    return results
  end

  # Not implemented
  def self.autocomplete(query)
    tag_feed.redis.zrangebylex("tag::tag_feed","[#{query}","[#{query}\xff",["LIMIT","0","10"])
  end

  def self.blacklisted?(tags)
    unless tags.is_a?(Array)
      return CONFIG[:blacklisted_tags].include?(tags.downcase)
    end
    blacklisted = false
    tags.each do |tag|
      blacklisted ||= CONFIG[:blacklisted_tags].include?(tag.downcase)
    end
    return blacklisted
  end

  def self.populate_from_existing!
    sections = Media.pluck(:section)  
    available_tags = sections.uniq!
    available_tags.each do |name|
      Tag.create(name: name)
    end
  end

  def self.populate!
    Media.pluck(:section).uniq.each do |name|
      begin
        Tag.create(name: name)
      rescue ActiveRecord::RecordNotUnique => e
        next if(e.message =~ /unique.*constraint.*name/)
        raise "Something else happened #{e}"
      end
    end
  end

  def self.clean_names
    Tag.select(:id, :name).find_all do |t|
      @oldName = t.name
      @cleanName = t.name.gsub(/[^0-9A-Za-z_]/, '')
      if @cleanName.empty?
        puts "About to destroy tag_id = #{t.id} because it is empty"
        m = Media.tagged_with(@oldName, :wild => true)
        m.each do |media|
          media.tag_list.remove(@oldName)
          media.save
          puts "tag #{@oldName} removed from Media.id = #{media.id}"
        end
        t.destroy
      else
        begin
          t.update_column('name', @cleanName)
        rescue ActiveRecord::RecordNotUnique
          m = Media.tagged_with(@oldName, :wild => true)
          m.each do |media|
            media.tag_list.remove(@oldName)
            media.tag_list.add(@cleanName)
            media.save  
            puts "Media.id = #{media.id} retagged with #{@cleanName}"
          end
          t.destroy
        end
      end 
    end
  end

  protected

  def scrub_name
    self.name.gsub!(/[^0-9A-Za-z_]/, '')
    if self.name.empty?
      raise "Could not create tag, nothing left after removing whitespace and special chars"
    end 
  end

end
