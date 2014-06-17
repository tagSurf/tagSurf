class GenerateTagFeed
  include Sidekiq::Worker

  def perform
    tags = Tag.all
    tag.each do |tag|

      # Refresh all the tags
      tag.tag_feed.delete(tag.name)

      if Tag.blacklisted?(tag.name)
        tag.tag_feed.delete(tag.name)
      elsif votes > 0
        tag.tag_feed[tag.name] = Vote.where(vote_tag: tag.name).count
      elsif Media.tagged_with(tag.name, :wild => true).count > 0
        tag.tag_feed[tag.name] = 0
      else
        next
      end

    end
  end

end
