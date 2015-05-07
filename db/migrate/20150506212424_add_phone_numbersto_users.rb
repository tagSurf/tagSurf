class AddPhoneNumberstoUsers < ActiveRecord::Migration
  def change
  	add_column :users, :phone, :string
  	add_column :users, :phone_confirmed, :boolean, null: false, default: false
  	add_column :users, :phone_confirmed_at, :datetime
  end
end
