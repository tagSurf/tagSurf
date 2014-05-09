class RenameVoteScopeToTag < ActiveRecord::Migration
  def change
    rename_column :votes, :vote_scope, :vote_tag
    add_index :votes, :vote_tag
  end
end
