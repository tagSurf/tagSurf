class SendReferNotification
  include Sidekiq::Worker

  sidekiq_options :backtrace => true

  def perform(user_id, referrer_id, media_id) 
    ReferMailer.referred_media_email(user_id, referrer_id, Media.unscoped.find(media_id)).deliver
  end

end