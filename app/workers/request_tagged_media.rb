# There is a cron worker populating tagged feeds every 15 min
# This worked runs when a tag the API return too few cards
# Current threshold < 10 cards
class RequestTaggedMedia
  
  include Sidekiq::Worker

  def perform(tag_name)
    unless tag = Tag.where('name ilike ?', tag_name).first
      tag = Tag.create!(name: tag_name)
    end
    Media.populate_tag(tag.name)
  end

end
