class FbLink < ActiveRecord::Migration
  def change
  	add_column :users, :fb_link_requested, :boolean, null: false, default: false
  end
end
