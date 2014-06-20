class AddTsTypeToMedia < ActiveRecord::Migration
  def change
    add_column :media, :ts_type, :string, default: "content", null: false 
    add_index :media, :ts_type 
  end
end
