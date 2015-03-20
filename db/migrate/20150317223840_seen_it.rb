class SeenIt < ActiveRecord::Migration
  def change
    add_column :referrals, :seen, :boolean, null: false, default: false 
    add_column :bumps, :seen, :boolean, null: false, default: false 
  end
end
