class ChangeCardsToMedia < ActiveRecord::Migration
  def change
    rename_table :cards, :media
  end
end
