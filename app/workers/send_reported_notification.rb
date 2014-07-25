class SendReportedNotification
  include Sidekiq::Worker

  sidekiq_options :backtrace => true

  def perform(user_id, media_id) 
    ReportMailer.reported_media_email(user_id, Media.unscoped.find(media_id)).deliver
  end

end
