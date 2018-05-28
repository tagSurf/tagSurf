class SendFriendRequestNotification
  include Sidekiq::Worker

  sidekiq_options :backtrace => true, :retry =>  3

  def perform(user_id, friender_id)
	if Rails.env.development? 
		return
	end

	@user = User.find(user_id)
	@user.update_column('reload_deck', true)

	friender_name = User.find(friender_id).username
	
	FriendRequestMailer.friend_request_email(user_id, friender_id).deliver

	message = "@#{friender_name} sent you a friend request"

	notification = {
		:aliases => [user_id],
		:aps => {:alert => message}
	}

	Urbanairship.push(notification)
  end

end