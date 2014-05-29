class FavoritesChangeCardIdToMediaId < ActiveRecord::Migration
  def change
    rename_column :favorites, :card_id, :media_id
  end
end
