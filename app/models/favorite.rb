class Favorite < ActiveRecord::Base

  validates_presence_of :user_id
  validates_presence_of :resource_id

  belongs_to :user

end
