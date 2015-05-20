class ConfirmationCodesController < ApplicationController
	def send_code(user_id)
		@user = User.find(user_id)
	    message = "Your tagSurf verification code is: " + @user.confirmation_code.code.to_s
	    SmsController.new.send_sms(message, @user.phone)
	end

	def verify_code(user_id = params[:user_id], code = params[:code].first)

		@success = User.verify_code(user_id, code)
		if @success
			redirect_to linkcontacts_path, :notice => "Phone number confirmed"
		else
			flash[:error] = ["Invalid code. Please try again."]
			redirect_to confirm_path
		end
	end

end
