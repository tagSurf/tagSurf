class BlankEmail < ActiveRecord::Migration
  def change
  	change_column_null :users, :email, :null => nil
  end
end
