class AddUserIdToTag < ActiveRecord::Migration
  def change
    add_column :tags, :created_by, :integer
  end
end
