class Tag < ActiveRecord::Base

  include Redis::Objects
  sorted_set :tag_feed, :global => true
  
  has_many :votes

  validates_presence_of :name

  default_scope where(:blacklisted => false)

  def self.current_feed(scores=true)
    @obj = Tag.new
    if @obj.tag_feed.members.any?
      if scores
        @obj.serialize(@obj.tag_feed.members(withscores: true).reverse, true)
      else
        @obj.serialize(@obj.tag_feed.members.reverse)
      end
    else
      tags = Tag.pluck(:name)
      GenerateTagFeed.perform_async
      @obj.serialize(tags)
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

  def self.blacklisted?(tag)
    CONFIG[:blacklisted_tags].include?(tag.downcase)
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

end
