class SendAnalytics
  include Sidekiq::Worker
  sidekiq_options :backtrace => true
  def perform(user_id, event, properties={}, timestamp)
    AnalyticsRuby.track(
      user_id: user_id.to_s, 
      event: event, 
      timestamp: timestamp.to_time,
      properties: properties)
  end

end
