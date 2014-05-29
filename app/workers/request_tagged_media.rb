# There is a cron worker populating tagged feeds every 15 min
# This worked runs when a tag the API return too few cards
# Current threshold < 10 cards
class RequestTaggedMedia
  
  include Sidekiq::Worker

  def perform(tag)
    tag = Tag.where(name: tag)
    Media.populate_tag(tag.name)
  end

end
