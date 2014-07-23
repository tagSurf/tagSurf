class ReportMailer < ActionMailer::Base
  default from: "beta@tagsurf.co"

  def reported_media_email(user_id, media)
    @user_id = user_id 
    @media = media
    mail(to: 'brett@koown.com', subject: "Media #{media.id} has been reported.")
  end
end
