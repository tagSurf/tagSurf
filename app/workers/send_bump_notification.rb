class SendBumpNotification
  include Sidekiq::Worker

  sidekiq_options :backtrace => true

  def perform(referral_id)
	if Rails.env.development? 
		return
	end

	ref = Referral.unscoped.find(referral_id)
	media = Media.unscoped.find(ref.media_id)
	user_id = ref.referrer_id
	@user = User.find(user_id)
	bumper_id = ref.user_id
	bumper = User.find(bumper_id)
	badge_number = Referral.unscoped.where(:user_id => user_id, :seen => false).count +
					Bump.unscoped.where(:sharer_id => user_id, :seen => false).count
    
    unless !@user.bump_mailers || (Bump.unscoped.where(:sharer_id => user_id).count > 3)
	    BumpMailer.bumped_media_email(user_id, bumper_id, media, referral_id).deliver
	end

	message = "@#{bumper.username} bumped it back!"

	notification = {
		:aliases => [user_id],
		:aps => {:alert => message, :badge => badge_number}
	}

	Urbanairship.push(notification)

  end

end