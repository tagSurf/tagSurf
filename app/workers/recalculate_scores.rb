class RecalculateScores
  include Sidekiq::Worker

  def perform
    Media.select(
      :id, 
      :ts_score, 
      :remote_score, 
      :created_at, 
      :time_bonus_expired
    ).where(
     :time_bonus_expired => true
    ).find_in_batches(:batch_size => 10000) do |m|
	    m.each do |m|
	      score = m.remote_score.to_i + (m.up_votes.to_i * 1000000) + 
	        ((m.favorites.count + m.bumps.count) * 10000000)
	      m.update_columns(ts_score: score)
	    end
	  end

    Media.select(
      :id, 
      :ts_score, 
      :remote_score, 
      :created_at, 
      :time_bonus_expired
    ).where(
	    created_at: 3.days.ago..7.days.ago
    ).where(
     :time_bonus_expired => false
    ).find_in_batches(:batch_size => 10000) do |m|
	    m.each do |m|
	    	time_bonus = m.created_at.to_i - 1350000000
	      score = m.remote_score.to_i + (m.up_votes.to_i * 1000000) + 
	        ((m.favorites.count + m.bumps.count) * 10000000)
	      m.update_columns(ts_score: score + time_bonus)
	    end
		end

    Media.select(
      :id, 
      :ts_score, 
      :remote_score, 
      :created_at, 
      :time_bonus_expired
    ).where(
	    created_at: 3.days.ago..Time.now
    ).where(
     :time_bonus_expired => false
    ).find_in_batches(:batch_size => 10000) do |m|
	    m.each do |m|
	    	time_bonus = m.created_at.to_i - 1300000000
	      score = m.remote_score.to_i + (m.up_votes.to_i * 1000000) + 
	        ((m.favorites.count + m.bumps.count) * 10000000)
	      m.update_columns(ts_score: score + time_bonus)
	    end
		end

	end

end