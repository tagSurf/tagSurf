class ChangeTitleToTextOnCards < ActiveRecord::Migration
  def change
    change_column :cards, :title, :text
  end
end
