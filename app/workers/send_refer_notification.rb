class SendReferNotification
  include Sidekiq::Worker

  sidekiq_options :backtrace => true

  def perform(user_id, referrer_id, media_id)
    unless !User.find(user_id).refer_mailers
	    ReferMailer.referred_media_email(user_id, referrer_id, Media.unscoped.find(media_id)).deliver
	end
  end

end