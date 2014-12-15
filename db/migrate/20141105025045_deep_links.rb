class DeepLinks < ActiveRecord::Migration
  def change
  	add_column :media, :deep_link, :string
  	add_column :media, :web_link, :string
  	add_column :media, :deep_link_action, :string
  	add_column :media, :deep_link_icon, :string
  	add_column :media, :deep_link_desc, :string
  	add_column :media, :deep_link_type, :string
  end
end
