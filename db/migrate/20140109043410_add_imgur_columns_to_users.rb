class AddImgurColumnsToUsers < ActiveRecord::Migration
  def change
    add_column :users, :imgur_refresh_token,       :string
    add_column :users, :imgur_auth_token,               :string
    add_column :users, :imgur_token_created_at,    :datetime
    add_column :users, :imgur_token_expires_at,    :datetime
    add_column :users, :imgur_pro_expiration,      :boolean
    add_column :users, :active,                    :boolean
  end
end
