class FixScores < ActiveRecord::Migration
  def change
    Media.select(
    	:id,
    	:created_at,
    	:remote_score
    	).where(:time_bonus_expired => false).where(:created_at => 3.days.ago..Time.now).find_each(batch_size: 10000) do |m|
    	m.init_vote_counter!
    	score = m.remote_score + m.created_at.to_i - 1300000000 + (m.up_votes.to_i * 1000000)
    	m.update_column('ts_score', score)
    end
    Media.select(
    	:id,
    	:created_at,
    	:remote_score
    	).where(:time_bonus_expired => false).where(:created_at => 7.days.ago..3.days.ago).find_each(batch_size: 10000) do |m|
    	m.init_vote_counter!
    	score = m.remote_score.to_i + m.created_at.to_i - 1350000000 + (m.up_votes.to_i * 1000000)
    	m.update_column('ts_score', score)
    end
    Media.select(:id, :remote_score).where(:time_bonus_expired => true).find_each(batch_size: 10000) do |m|
    	m.init_vote_counter!
    	score = m.remote_score.to_i + (m.up_votes.to_i * 1000000)
    	m.update_column('ts_score', score)
    end
  end
end
