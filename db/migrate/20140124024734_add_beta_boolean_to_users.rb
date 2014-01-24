class AddBetaBooleanToUsers < ActiveRecord::Migration
  def change
    add_column :users, :beta_user, :boolean
  end
end
