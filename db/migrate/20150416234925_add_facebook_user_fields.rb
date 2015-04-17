class AddFacebookUserFields < ActiveRecord::Migration
  def change
  	add_column :users, :first_name, 					:string
  	add_column :users, :last_name, 						:string
  	add_column :users, :profile_pic_link,				:string
    add_column :users, :facebook_auth_token,          	:string
    add_column :users, :facebook_token_created_at,    	:datetime
    add_column :users, :facebook_token_expires_at,    	:datetime
    add_column :users, :gender,							:string
    add_column :users, :location, 						:string
  end
end
