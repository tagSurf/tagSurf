class SendBumpNotification
  include Sidekiq::Worker

  sidekiq_options :backtrace => true, :retry =>  3

  def perform(referral_id)
		if Rails.env.development? 
			return
		end

		ref = Referral.unscoped.find(referral_id)
		user_id = ref.referrer_id
		@user = User.find(user_id)
		bumper_id = ref.user_id.to_i
		@bumper = User.find(bumper_id)
	    
	  unless !@user.bump_mailers || (Bump.unscoped.where(:sharer_id => user_id).count > 3)
			media = Media.unscoped.find(ref.media_id)
	    BumpMailer.bumped_media_email(user_id, bumper_id, media, referral_id).deliver
		end

		if @user.last_seen > 5.minutes.ago
			message = "@#{@bumper.username} bumped it back!"
			badge_number = Referral.unscoped.where(:user_id => user_id, :seen => false).count +
						Bump.unscoped.where(:sharer_id => user_id, :seen => false).count
			notification = {
				:aliases => [user_id],
				:aps => {:alert => message, :badge => badge_number}
			}

			Urbanairship.push(notification)
		else
			unless @user.notifications[bumper_id].nil? 
				h = eval(@user.notifications[bumper_id])
				h[:bumps] = h[:bumps].nil? ? 1 : h[:bumps] + 1
				@user.notifications[bumper_id] = h
				return
			end

			@user.notifications[bumper_id] = {:bumps => 1}
		end

  end

end