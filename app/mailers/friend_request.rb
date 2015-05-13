class FriendRequestMailer < ActionMailer::Base
  default from: "tagSurf@tagsurf.co"

	def friend_request_email(user_id, friender_id)
  		@user_id = user_id
  		@email = User.find(user_id).email
	    @username = User.find(user_id).username ? User.find(user_id).username : @email.split("@")[0]
  		friender = User.find(friender_id)
  		@friender_username = friender.username
  		@friender_name ||= friender.first_name
  		if @friender_name.nil?
  			@friender_name ||= friender.last_name
  		else
  			@friender_name = friender.last_name.nil? ? @friender_name : @friender_name + " " + friender.last_name
  		end
  		@friender_profile_pic = friender.profile_pic_link.nil? ? "http://assets.tagsurf.co/img/UserAvatar.png" :
  																 friender.profile_pic_link 
	    mail(to: @email, subject: "@#{@friender_username} sent you a friend request", from_email: "tagSurf@tagsurf.co", async: "true", from_name: "tagSurf")
  	end
end
