class MailerUnsubscribe < ActiveRecord::Migration
  def change
    add_column :users, :refer_mailers, :boolean, null: false, default: true  
  end
end
