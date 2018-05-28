class SendFriendAcceptNotification
  include Sidekiq::Worker

  sidekiq_options :backtrace => true, :retry =>  3

  def perform(user_id, acceptor_id)
	if Rails.env.development? 
		return
	end

	@user = User.find(user_id)
	@user.update_column('update_buddies', true)

	acceptor_name = User.find(acceptor_id).username

	
	FriendAcceptMailer.friend_accept_email(user_id, acceptor_id).deliver

	message = "@#{acceptor_name} accepted your friend request!"

	notification = {
		:aliases => [user_id],
		:aps => {:alert => message}
	}

	Urbanairship.push(notification)
  end

end