class CreateAccessCodes < ActiveRecord::Migration
  def change
    create_table :access_codes do |t|
      t.string :name
      t.string :code
      t.boolean :expires
      t.datetime :start_date
      t.datetime :end_date

      t.timestamps
    end

    add_column :users, :access_code_id, :integer
    add_column :users, :beta_tester_agreement, :boolean, default: false, null: false
  end
end
