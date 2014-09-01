class PopulateViralMedia
  include Sidekiq::Worker

  def perform
    Media.where(viral: true, nsfw: false).pluck(:id).each do |id|
      Media.redis.sadd("media:viral_feed", id)
    end
  end

end
