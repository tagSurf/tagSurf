class CreateFavorites < ActiveRecord::Migration
  def change
    create_table :favorites do |t|
      t.string :resource_type
      t.integer :resource_id
      t.integer :user_id

      t.timestamps
    end

    add_index :favorites, :user_id 
    add_index :favorites, :resource_id 
  end
end
