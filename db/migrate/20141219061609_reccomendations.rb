class Reccomendations < ActiveRecord::Migration
  def self.up
  	create_table :referrals do |t|
      t.integer	 :referable_id
      t.string 	 :referable_type
      t.integer	 :user_id
      t.integer	 :referer_id
      t.string 	 :referrer_type

      t.timestamps
    end
  end

  def self.down
  	drop_table :referrals
  end
end
