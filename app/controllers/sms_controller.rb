class SmsController < ApplicationController
  def send(message, number)
    twilio_sid = ENV["TS_TWILIO_SID"]
    twilio_token = ENV["TS_TWILIO_TOKEN"]
    
    @twilio_client = Twilio::REST::Client.new twilio_sid, twilio_token

		@twilio_client.account.sms.messages.create(
      :from => ENV["TS_TWILIO_PHONE_NUMBER"],
      :to => number,
      :body => message
    )
  end

  def receive
  	message_body = params["Body"]
    from_number = params["From"]
 
    SMSLogger.log_text_message from_number, message_body

    if params["Body"].include? "STOP"
    	@twilio_client = Twilio::REST::Client.new twilio_sid, twilio_token

			@twilio_client.account.sms.messages.create(
	      :from => ENV["TS_TWILIO_PHONE_NUMBER"],
	      :to => params["From"],
	      :body => "Unsubscribed"
	    )
		end
  end
end
