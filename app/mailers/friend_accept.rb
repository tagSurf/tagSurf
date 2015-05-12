class FriendAcceptMailer < ActionMailer::Base
  default from: "tagSurf@tagsurf.co"

  	def friend_accept_email(user_id, acceptor_id)
  		@user_id = user_id
  		@email = User.find(user_id).email
	    @username = User.find(user_id).username ? User.find(user_id).username : @email.split("@")[0]
  		acceptor = User.find(acceptor_id)
  		@acceptor_username = acceptor.username
      if @acceptor_name.nil?
        @acceptor_name ||= acceptor.last_name
      else
        @acceptor_name = acceptor.last_name.nil? ? @acceptor_name : @acceptor_name + " " + acceptor.last_name
      end
  		@acceptor_profile_pic = acceptor.profile_pic_link.nil? ? "http://assets.tagsurf.co/img/UserAvatar.png" :
  																 acceptor.profile_pic_link
	    mail(to: @email, subject: "@#{@acceptor_username} accepted your friend request!", from_email: "tagSurf@tagsurf.co", async: "true", from_name: "tagSurf")
  	end
end
