class AddLargerImageLinkToCard < ActiveRecord::Migration
  def change
    add_column :cards, :image_link_huge, :string
  end
end
