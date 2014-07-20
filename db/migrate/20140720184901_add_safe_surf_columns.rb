class AddSafeSurfColumns < ActiveRecord::Migration
  def change
    add_column :users, :safe_mode, :boolean, null: false, default: true

    add_column :media, :reported, :boolean, null: false, default: false
    add_column :media, :nsfw, :boolean, null: false, default: false

    add_index :media, :reported
    add_index :media, :nsfw
    add_index :media, :viral
  end
end
