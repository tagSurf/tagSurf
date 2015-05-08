class Api::FriendsController < Api::BaseController

	before_filter :find_authenticated_user

	def create
		@user = current_user

		@result = @user.friend_request(User.find(params[:user_id]))

		@success = !@result.nil?
		
		if @success
      render json: {created: true}, status: :ok
    else 
      render json: {created: false, reason: "request already made" }, status: :not_implemented
    end
	end

	def accept
		begin
			@user = current_user

			@result = @user.accept_request(User.find(params[:user_id]))

			@success = !@result.nil?

			if @success
	      render json: {accepted: true}, status: :ok
	    else 
	      render json: {created: false, reason: @result.errors.full_messages.first }, status: :not_implemented
	    end

	  rescue => e
      render json: {created: false, reason: "no friendship found" }, status: :not_implemented
    end
  end

  def decline
		begin
			@user = current_user

			@result = @user.decline_request(User.find(params[:user_id]))

			@success = !@result.nil?

			if @success
	      render json: {destroyed: true}, status: :ok
	    else 
	      render json: {destroyed: false, reason: @result.errors.full_messages.first }, status: :not_implemented
	    end
	  rescue => e
      render json: {destroyed: false, reason: "no request found" }, status: :not_implemented
    end
  end

	def destroy
		begin
			@user = current_user

			@result = @user.remove_friend(User.find(params[:user_id]))

			@success = !@result.nil?

			if @success
	      render json: {destroyed: true}, status: :ok
	    else 
	      render json: {destroyed: false, reason: @result.errors.full_messages.first }, status: :not_implemented
	    end
	  rescue => e
      render json: {destroyed: false, reason: "no request found" }, status: :not_implemented
    end
  end

  def match_contacts
    @contacts = User.match_users(params["_json"], current_user.id)
  end 

end
