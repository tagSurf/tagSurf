class GenerateTagFeed
  include Sidekiq::Worker

  def perform(feed_type)
    tags = Tag.all
    if feed_type == 'nsfw'
      tags.each do |tag|
        votes = Vote.where(vote_tag: tag.name).count
        if votes > 0
          tag.nsfw_tag_feed[tag.name] = votes
        elsif Media.tagged_with(tag.name, :wild => true).count > 0
          tag.nsfw_tag_feed[tag.name] = 0
        else
          tag.nsfw_tag_feed.delete(tag.name)
        end
      end
    else 
      tags.each do |tag|
        votes = Vote.where(vote_tag: tag.name).count
        if Tag.blacklisted?(tag.name)
          tag.safe_tag_feed.delete(tag.name)
        elsif votes > 0
          tag.safe_tag_feed[tag.name] = votes
        elsif Media.tagged_with(tag.name, :wild => true).count > 0
          tag.safe_tag_feed[tag.name] = 0
        else
          tag.safe_tag_feed.delete(tag.name)
        end
      end

    end
  end

end
