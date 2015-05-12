class SendFriendAcceptNotification
  include Sidekiq::Worker

  sidekiq_options :backtrace => true

  def perform(user_id, acceptor_id)
	# if Rails.env.development? 
	# 	return
	# end

	acceptor_name = User.find(acceptor_id).username
	badge_number = Referral.unscoped.where(:user_id => user_id, :seen => false).count +
					Bump.unscoped.where(:sharer_id => user_id, :seen => false).count
	
	FriendAcceptMailer.friend_accept_email(user_id, acceptor_id).deliver

	message = "@#{acceptor_name} accepted your friend request!"

	notification = {
		:aliases => [user_id],
		:aps => {:alert => message, :badge => badge_number}
	}

	Urbanairship.push(notification)
  end

end