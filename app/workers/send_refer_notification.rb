class SendReferNotification
  include Sidekiq::Worker

  sidekiq_options :backtrace => true

  def perform(referral_id)
	ref = Referral.unscoped.find(referral_id)
	media = Media.unscoped.find(ref.media_id)
	referrer_id = ref.referrer_id
	user_id = ref.user_id
	referrer_name = User.find(referrer_id).username
    unless !User.find(user_id).refer_mailers
	    ReferMailer.referred_media_email(user_id, referrer_id, media, referral_id).deliver
	end

	message = "@#{referrer_name} shared something with you!"

	notification = {
		:aliases => [user_id],
		:aps => {:alert => message, :badge => 1}
	}

	Urbanairship.push(notification)
  end

end