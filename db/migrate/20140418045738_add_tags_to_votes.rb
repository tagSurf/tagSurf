class AddTagsToVotes < ActiveRecord::Migration
  def change
    add_column :votes, :tag_id, :integer
    add_column :votes, :cached_tag_name, :string

    add_index :votes, :tag_id 
    add_index :votes, :cached_tag_name
  end
end
