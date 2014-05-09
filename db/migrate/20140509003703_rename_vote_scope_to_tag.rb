class RenameVoteScopeToTag < ActiveRecord::Migration
  def change
    rename_column :votes, :vote_scope, :vote_tag
    add_index :votes, :vote_tag

    add_column :cards, :repopulate_score, :boolean, default: true, null: false
    add_index :cards, :repopulate_score
  end
end
