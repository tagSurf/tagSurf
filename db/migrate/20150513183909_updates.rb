class Updates < ActiveRecord::Migration
  def change
	  add_column :users, :reload_deck, :boolean, null: false, default: false 
	  add_column :users, :update_buddies, :boolean, null: false, default: false 
	end
end
