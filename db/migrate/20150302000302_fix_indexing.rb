class FixIndexing < ActiveRecord::Migration
  def change
  	rename_column :referrals, :referrable_id, :media_id
  end
end
