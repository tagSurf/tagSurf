class AddTsScoreToCards < ActiveRecord::Migration
  def change
    add_column :cards, :ts_score, :integer, :null => false, :default => 0
    add_column :cards, :last_touched, :datetime
  end
end
