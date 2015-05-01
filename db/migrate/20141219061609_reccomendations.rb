class Reccomendations < ActiveRecord::Migration
  def self.up
  	create_table :referrals do |t|
      t.integer	 :referrable_id
      t.string 	 :referrable_type
      t.integer	 :user_id
      t.integer	 :referrer_id
      t.string 	 :referrer_type
      t.timestamps
      t.boolean  :voted, :null => false, :default => false
    end

    add_index :referrals, :user_id
    add_index :referrals, :referrable_id
    add_index :referrals, :voted
  end

  def self.down
  	drop_table :referrals
  end
end
