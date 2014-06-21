class AddTimeBonusBooleanToMedia < ActiveRecord::Migration
  def change
    add_column :media, :time_bonus_expired, :boolean, :default => false, :null => false
  end
end
