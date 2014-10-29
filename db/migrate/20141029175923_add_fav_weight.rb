class AddFavWeight < ActiveRecord::Migration
  def change
  	Media.joins(:favorites).find_each(batch_size: 10000) do |m|
    	score = m.ts_score + (Favorite.where(:media_id => m.id).count * 9000000)
    	m.update_column('ts_score', score)
    end
  end
end
