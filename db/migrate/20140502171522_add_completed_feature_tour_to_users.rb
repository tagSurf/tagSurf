class AddCompletedFeatureTourToUsers < ActiveRecord::Migration
  def change
    add_column :users, :completed_feature_tour, :boolean, default: false
  end
end
