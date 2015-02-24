class ReferMailer < ActionMailer::Base
  default from: "no-reply@tagsurf.co"

  def referred_media_email(user_id, referrer_id, media)
    @referrer_name = User.where(id: referrer_id)[0].email.split("@")[0]
    @email = User.where(id: user_id)[0].email
    @username = @email.split("@")[0]
    @media = media
    @url = Rails.env.production? ? "http://beta.tagsurf.co" : "http://localhost:3000"
    mail(to: @email, subject: "#{@referrer_name} has recommended something for you on tagSurf!")
  end
end
