class CleanUpData < ActiveRecord::Migration
  def change
    media = Media.select(:id, :remote_score, :created_at).where(
    	:time_bonus_expired => false
    	).where(
    	"created_at < ?", 3.days.ago
    	)
    media.each do |m|
      total = Vote.where(:votable_id => m.id).count
      up = Vote.where(:votable_id => m.id, :vote_flag => true).count
      down = total - up
      favs = Favorite.where(:media_id => m.id).count
      score = m.remote_score + (1000000 * (up - down)) + (favs * 9000000) + m.created_at.to_i - 1300000000
      m.update_column('ts_score', score)
    end
		media = Media.select(:id, :remote_score, :created_at).where(
			:time_bonus_expired => false
			).where(
			:created_at => 3.days.ago..7.days.ago
			)
    media.each do |m|
      total = Vote.where(:votable_id => m.id).count
      up = Vote.where(:votable_id => m.id, :vote_flag => true).count
      down = total - up
      favs = Favorite.where(:media_id => m.id).count
      score = m.remote_score + (1000000 * (up - down)) + (favs * 9000000) + m.created_at.to_i - 1350000000
      m.update_column('ts_score', score)
    end
    media = Media.select(:id, :remote_score).where(:time_bonus_expired => true).order('created_at DESC')
    media.each do |m|
      total = Vote.where(:votable_id => m.id).count
      up = Vote.where(:votable_id => m.id, :vote_flag => true).count
      down = total - up
      favs = Favorite.where(:media_id => m.id).count
      score = m.remote_score + (1000000 * (up - down)) + (favs * 9000000)
      m.update_column('ts_score', score)
    end
  end
end
