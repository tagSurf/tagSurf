class ReportMailer < ActionMailer::Base
  default from: "beta@tagsurf.co"

  def reported_media_email(user_id, media)
    @user_id = user_id 
    @media = media
    @url = Rails.env.production? ? "http://beta.tagsurf.co" : "http://localhost:3000"
    mail(to: 'beta@tagsurf.co', subject: "Media #{media.id} has been reported.")
  end
end
