class AddBlacklistedToTags < ActiveRecord::Migration
  def change
    add_column :tags, :blacklisted, :boolean, null: false, default: false
  end
end
