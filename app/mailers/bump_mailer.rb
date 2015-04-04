class BumpMailer < ActionMailer::Base
  default from: "tagSurf@tagsurf.co"

  def bumped_media_email(user_id, bumper_id, media, referral_id)
    @bumper_name = User.find(bumper_id).username ? User.find(bumper_id).username : 
                                                    User.find(bumper_id).email.split("@")[0]
    @user_id = user_id
    @email = User.find(user_id).email
    @username = User.find(user_id).username ? User.find(user_id).username : @email.split("@")[0]
    @media = media
    @referral_id = referral_id
    @caption =  @media.description ? @media.description : @media.title
    @url = Rails.env.production? ? "http://beta.tagsurf.co" : "http://localhost:3000"
    mail(to: @email, subject: "#{@bumper_name} bumped it back on tagSurf!", from_email: "tagSurf@tagsurf.co", async: "true", from_name: "tagSurf")
  end
end
