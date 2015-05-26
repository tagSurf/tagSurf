class SendReferNotification
  include Sidekiq::Worker

  sidekiq_options :backtrace => true

  def perform(referral_id)
		if Rails.env.development? 
			return
		end

		ref = Referral.unscoped.find(referral_id)
		referrer_id = ref.referrer_id
		user_id = ref.user_id
		@user = User.find(user_id)
		@referrer = User.find(referrer_id)
		
		unless ref.voted
			@user.update_column('reload_deck', true)
		end

    unless !@user.refer_mailers || (Referral.unscoped.where(:user_id => user_id).count > 3) 
			media = Media.unscoped.find(ref.media_id)
	    ReferMailer.referred_media_email(user_id, referrer_id, media, referral_id).deliver
		end

		if @user.last_seen > 5.minutes.ago
			message = "@#{@referrer.username} bumped something to you!"
			badge_number = Referral.unscoped.where(:user_id => user_id, :seen => false).count +
									Bump.unscoped.where(:sharer_id => user_id, :seen => false).count
			notification = {
				:aliases => [user_id],
				:aps => {:alert => message, :badge => badge_number}
			}

			Urbanairship.push(notification)
		else
			unless @user.notifications[referrer_id].nil? 
				h = eval(@user.notifications[referrer_id])
				h[:referrals] = h[:referrals].nil? ? 1 : h[:referrals] + 1
				@user.notifications[referrer_id] = h
				return
			end

			@user.notifications[referrer_id] = {:referrals => 1}
		end

  end

end