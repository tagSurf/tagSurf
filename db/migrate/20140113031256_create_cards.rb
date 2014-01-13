class CreateCards < ActiveRecord::Migration
  def change
    create_table :cards do |t|
      t.string   :remote_id
      t.string   :remote_provider
      t.datetime :remote_created_at
      t.string   :link
      t.string   :title
      t.text     :description
      t.string   :content_type
      t.boolean  :animated
      t.integer  :width
      t.integer  :height
      t.integer  :size
      t.integer  :imgur_views
      t.integer  :bandwidth
      t.string   :delete_hash
      t.string   :section

      t.timestamps
    end
  end
end
