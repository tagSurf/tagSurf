class GenerateTagFeed
  include Sidekiq::Worker

  def perform
    tags = Tag.all
    tag.each do |tag|
      votes = Vote.where(vote_tag: tag.name).count
      if Tag.blacklisted?(tag.name)
        tag.tag_feed.delete(tag.name)
      elsif votes > 0
        tag.tag_feed[tag.name] = votes
      elsif Media.tagged_with(tag.name, :wild => true).count > 0
        tag.tag_feed[tag.name] = 0
      else
        tag.tag_feed.delete(tag.name)
      end
    end
  end

end
