class SendReferNotification
  include Sidekiq::Worker

  sidekiq_options :backtrace => true

  def perform(referral_id)
	ref = Referral.unscoped.find(referral_id)
	media = Media.unscoped.find(ref.referrable_id)
	referrer_id = ref.referrer_id
	user_id = ref.user_id
    unless !User.find(user_id).refer_mailers
	    ReferMailer.referred_media_email(user_id, referrer_id, media, referral_id).deliver
	end
  end

end