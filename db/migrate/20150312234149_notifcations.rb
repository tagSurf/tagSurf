class Notifcations < ActiveRecord::Migration
  def change
    add_column :users, :push_requested, :boolean, null: false, default: false 
  end
end
