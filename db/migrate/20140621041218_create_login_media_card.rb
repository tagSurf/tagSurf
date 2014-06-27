class CreateLoginMediaCard < ActiveRecord::Migration
  def change
    Media.create!(ts_type: 'login')
  end
end
