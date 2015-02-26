class BumpMailerFlag < ActiveRecord::Migration
  def change
    add_column :users, :bump_mailers, :boolean, null: false, default: true  
  end
end
