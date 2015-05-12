class SendFriendRequestNotification
  include Sidekiq::Worker

  sidekiq_options :backtrace => true

  def perform(user_id, friender_id)
	# if Rails.env.development? 
	# 	return
	# end

	friender_name = User.find(friender_id).username
	badge_number = Referral.unscoped.where(:user_id => user_id, :seen => false).count +
					Bump.unscoped.where(:sharer_id => user_id, :seen => false).count
	
	FriendRequestMailer.friend_request_email(user_id, friender_id).deliver

	message = "@#{friender_name} sent you a friend request"

	notification = {
		:aliases => [user_id],
		:aps => {:alert => message, :badge => badge_number}
	}

	Urbanairship.push(notification)
  end

end