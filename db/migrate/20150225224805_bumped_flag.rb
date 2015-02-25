class BumpedFlag < ActiveRecord::Migration
  def change
    add_column :referrals, :bumped, :boolean, null: false, default: false  
  end
end
