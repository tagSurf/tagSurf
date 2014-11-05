class LongUrls < ActiveRecord::Migration
  def change
  	change_column :media, :image_link_original, :text
  	change_column :media, :deep_link, :text
  	change_column :media, :web_link, :text
  	change_column :media, :image_link_tiny, :text
  	change_column :media, :image_link_thumbnail, :text
  	change_column :media, :image_link_medium, :text
  	change_column :media, :image_link_large, :text
  	change_column :media, :image_link_huge, :text
  end
end
