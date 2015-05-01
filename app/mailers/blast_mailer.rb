class BlastMailer < ActionMailer::Base
  default from: "Paul@tagSurf.co"

  def blast_mailer(user_id)
		@email = User.find(user_id).email
		@user_id = user_id
		@username = User.find(user_id).username ? User.find(user_id).username : @email.split("@")[0]
    mail(to: @email, subject: "Thanks for being awesome", from_email: "Paul@tagSurf.co", async: "true", from_name: "Paul")
  end
end
