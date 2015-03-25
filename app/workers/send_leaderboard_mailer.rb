class SendLeaderboardMailer
  include Sidekiq::Worker
  include Sidetiq::Schedulable

  recurrence { weekly.day(:monday).hour_of_day(15).minute_of_hour(30) }
  
  def perform
	
		if Rails.env.development? 
			return
		end
		# media_ids = Vote.where(:created_at => 7.days.ago..Time.now).select(:votable_id).map { |e| e.votable_id }

		media_ids = Referral.where(:created_at => 7.days.ago..Time.now).select(:media_id).map { |e| e.media_id}

		media_ids.uniq!

	  @top_media = Media.where('not nsfw and id in (?)', media_ids).where(:created_at => 7.days.ago..Time.now).limit(10).order('ts_score DESC NULLS LAST')

	  scores = Hash.new(0)

	  @top_media.each do |m|
			refs = Referral.unscoped.where(:media_id => m.id).select(:referrer_id, :bumped)	
	  	users = Hash[refs.map { |h| [h.referrer_id] }.uniq]
	  	shares = refs.map { |h| h.referrer_id }.inject(Hash.new(0)) { |h, e| h[e] += 1 ; h }
	  	bumps = Hash.new(0)
	  	
	  	refs.each do |r|
	  		bumps[r.referrer_id] = bumps[r.referrer_id] + (r.bumped ? 1 : 0)
	  	end

	  	users.each do |u|
	  		unless shares[u[0]] == 0
	  			users[u[0]] = (bumps[u[0]].to_f/shares[u[0]])*bumps[u[0]].to_f
	  			scores[u[0]] = scores[u[0]].to_f + users[u[0]]
	  		end
	  	end

	  	users = Hash[*users.sort_by{|k,v| v}.reverse.flatten]

	  	m.referrals_list = Array.new

	  	users.each do |u|
	  		m.referrals_list << {
				username: User.find(u[0]).username ? 
	                      User.find(u[0]).username : User.find(u[0]).email,
		        shares: shares[u[0]],
		        bumps: bumps[u[0]],
		        ratio: bumps[u[0]].to_f/shares[u[0]],
		        score: (bumps[u[0]].to_f/shares[u[0]])*bumps[u[0]]
	  		}
	  	end
	  end
	    
		scores = Hash[*scores.sort_by{|k,v| v}.reverse.flatten]
		winner_id = scores.first[0]
		winner_score = scores.first[1]

    User.all.select(:id).where(:leaderboard_mailers => true).map { |u| u.id }.each do |u|
	  	LeaderboardMailer.weekly_leaderboard_mailer(u, @top_media, winner_id, winner_score).deliver
		end
  end
end