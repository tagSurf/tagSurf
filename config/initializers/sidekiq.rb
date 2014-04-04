redis_url = Rails.env.development? ? 'redis://localhost:6379/0' : ENV['OPENREDIS_URL']

Sidekiq.configure_server do |config|
  config.redis = { :url => redis_url, :namespace => 'tagsurf' }
end

Sidekiq.configure_client do |config|
  config.redis = { :url => redis_url, :namespace => 'tagsurf' }
end
