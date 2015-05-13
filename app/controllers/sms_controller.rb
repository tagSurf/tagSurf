class SmsController < ApplicationController
  skip_before_filter :verify_authenticity_token  

  def send_sms(message, number)
    twilio_sid = ENV["TS_TWILIO_SID"]
    twilio_token = ENV["TS_TWILIO_TOKEN"]
    
    # disclaimer = "\n\nReply HELP for help. Reply STOP to unsubscribe. Reply YES to resubscribe."

    @twilio_client = Twilio::REST::Client.new twilio_sid, twilio_token

		@twilio_client.account.sms.messages.create(
      :from => ENV["TS_TWILIO_PHONE_NUMBER"],
      :to => number,
      :body => message
    )
  end

  def receive
  	message_body = sms_params[:body]
    from_number = sms_params[:from]
    #To Do Implement this function 
    # SMSLogger.log_text_message from_number, message_body
  end

  private

  def sms_params
  	params.permit(:body, :from)
  end
end
