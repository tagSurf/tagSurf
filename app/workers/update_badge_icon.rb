class UpdateBadgeIcon
  include Sidekiq::Worker

  sidekiq_options :backtrace => true

  def perform(user_id)
	badge_number = Referral.unscoped.where(:user_id => user_id, :seen => false).count +
					Bump.unscoped.where(:sharer_id => user_id, :seen => false).count

	notification = {
		:aliases => [user_id],
		:aps => {:badge => badge_number}
	}

	Urbanairship.push(notification)

  end

end