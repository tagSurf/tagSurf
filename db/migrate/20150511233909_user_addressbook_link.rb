class UserAddressbookLink < ActiveRecord::Migration
  def change
	  add_column :users, :contacts_link_requested, :boolean, null: false, default: false 
  end
end
