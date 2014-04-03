class ChangeFavoritesResourceId < ActiveRecord::Migration
  def change
    rename_column :favorites, :resource_id, :card_id
    remove_column :favorites, :resource_type
  end
end
