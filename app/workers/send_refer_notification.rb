class SendReferNotification
  include Sidekiq::Worker

  sidekiq_options :backtrace => true

  def perform(referral_id)
		if Rails.env.development? 
			return
		end

		ref = Referral.unscoped.find(referral_id)
		media = Media.unscoped.find(ref.media_id)
		referrer_id = ref.referrer_id
		user_id = ref.user_id
		@user = User.find(user_id)
		referrer_name = User.find(referrer_id).username
		badge_number = Referral.unscoped.where(:user_id => user_id, :seen => false).count +
						Bump.unscoped.where(:sharer_id => user_id, :seen => false).count
	    
		unless ref.voted
			@user.update_column('reload_deck', true)
		end

	    unless !@user.refer_mailers || (Referral.unscoped.where(:user_id => user_id).count > 3) 
		    ReferMailer.referred_media_email(user_id, referrer_id, media, referral_id).deliver
		end

		message = "@#{referrer_name} bumped something to you!"

		notification = {
			:aliases => [user_id],
			:aps => {:alert => message, :badge => badge_number}
		}

		Urbanairship.push(notification)
  end

end