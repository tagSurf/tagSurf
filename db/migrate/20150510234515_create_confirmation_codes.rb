class CreateConfirmationCodes < ActiveRecord::Migration
  def change
    create_table :confirmation_codes do |t|
      t.integer	:user_id
      t.integer :code
      t.boolean :expires
      t.datetime :start_date
      t.datetime :end_date

      t.timestamps
    end
    add_index :confirmation_codes, :user_id
  end
end
