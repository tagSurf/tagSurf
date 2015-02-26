class SendBumpNotification
  include Sidekiq::Worker

  sidekiq_options :backtrace => true

  def perform(user_id, bumper_id, media_id)
    unless !User.find(user_id).bump_mailers
	    BumpMailer.bumped_media_email(user_id, bumper_id, Media.unscoped.find(media_id)).deliver
	end
  end

end