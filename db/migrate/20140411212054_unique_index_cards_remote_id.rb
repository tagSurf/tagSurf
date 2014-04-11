class UniqueIndexCardsRemoteId < ActiveRecord::Migration
  def change
    add_index :cards, :remote_id, :unique => true
  end
end
