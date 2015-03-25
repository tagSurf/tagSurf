class LeaderboardMailerFlag < ActiveRecord::Migration
  def change
    add_column :users, :leaderboard_mailers, :boolean, null: false, default: true  
  end
end
