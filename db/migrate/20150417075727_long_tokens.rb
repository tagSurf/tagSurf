class LongTokens < ActiveRecord::Migration
  def change
	change_column :users, :facebook_auth_token, :text
  end
end
