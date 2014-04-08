class UpdateCardFields < ActiveRecord::Migration
  def change
    add_column :cards, :viral, :boolean, :default => false
    add_column :cards, :image_link_tiny, :string
    add_column :cards, :image_link_thumbnail, :string
    add_column :cards, :image_link_medium, :string
    rename_column :cards, :link, :image_link_original
    add_column :cards, :image_link_large, :string
    add_column :cards, :remote_up_votes, :integer
    add_column :cards, :remote_down_votes, :integer
    add_column :cards, :remote_score, :integer
    rename_column :cards, :imgur_views, :remote_views
  end
end
