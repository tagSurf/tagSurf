class SendBumpNotification
  include Sidekiq::Worker

  sidekiq_options :backtrace => true

  def perform(referral_id)
	ref = Referral.unscoped.find(referral_id)
	media = Media.unscoped.find(ref.media_id)
	user_id = ref.referrer_id
	bumper_id = ref.user_id
	bumper = User.find(bumper_id)
    unless !User.find(user_id).bump_mailers
	    BumpMailer.bumped_media_email(user_id, bumper_id, media, referral_id).deliver
	end

	message = "@#{bumper.username} gave you a bump!"

	notification = {
		:aliases => [user_id],
		:aps => {:alert => message, :badge => 1}
	}

	Urbanairship.push(notification)

  end

end