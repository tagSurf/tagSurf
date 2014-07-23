class SendMediaNotification
  include Sidekiq::Worker

  sidekiq_options :backtrace => true

  def perform(media_id) 
    # deliver mail here
  end

end
