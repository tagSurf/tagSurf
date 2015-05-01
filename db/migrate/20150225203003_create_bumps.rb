class CreateBumps < ActiveRecord::Migration
  def self.up
  	create_table :bumps do |t|
      t.integer	 :referral_id
      t.integer	 :media_id
      t.integer	 :sharer_id
      t.string	 :sharer_type
      t.integer	 :bumper_id
      t.string 	 :bumper_type
      t.timestamps
    end

    add_index :bumps, :sharer_id
    add_index :bumps, :bumper_id
  end

  def self.down
  	drop_table :bumps
  end
end
