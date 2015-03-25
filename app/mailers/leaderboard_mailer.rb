class LeaderboardMailer < ActionMailer::Base
  default from: "Paul@tagsurf.co"

	def weekly_leaderboard_mailer(user_id, top_media, winner_id, winner_score)
		@email = User.find(user_id).email
		@user_id = user_id
		@top_media = top_media
		@username = User.find(user_id).username ? User.find(user_id).username : @email.split("@")[0]
		@winner = User.find(winner_id).username
		@winner_score = winner_score
    @url = Rails.env.production? ? "http://beta.tagsurf.co" : "http://localhost:3000"
    mail(to: @email, subject: "Come play a game with me on tagSurf!", from_email: "paul@tagsurf.co", async: "true", from_name: "Paul")
  end

end
