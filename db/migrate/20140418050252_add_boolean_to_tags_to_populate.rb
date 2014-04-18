class AddBooleanToTagsToPopulate < ActiveRecord::Migration
  def change
    add_column :tags, :fetch_more_content, :boolean, :default => true, :null => false
  end
end
