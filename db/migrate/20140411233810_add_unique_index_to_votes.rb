class AddUniqueIndexToVotes < ActiveRecord::Migration
  def change
    add_index  :votes, [:voter_id, :votable_id, :votable_type], :unique => true
  end
end
