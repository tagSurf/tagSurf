redis_url = Rails.env.development? ? 'redis://localhost:6379/0' : ENV['OPENREDIS_URL']

Sidekiq.configure_server do |config|
  config.redis = { :url => redis_url, :namespace => 'tagsurf' }
  database_url = ENV['DATABASE_URL']
  if database_url
    ENV['DATABASE_URL'] = "#{database_url}?pool=25"
    ActiveRecord::Base.establish_connection
  end
end

Sidekiq.configure_client do |config|
  config.redis = { :url => redis_url, :namespace => 'tagsurf' }
end
