class Referral < ActiveRecord::Base
  validates_presence_of :user_id
  validates_presence_of :referer_id
  validates_presence_of :referable_id
  validates_uniqueness_of :user_id, :scope => :referer_id, :message => "already referred to user."

  belongs_to :user
  belongs_to :media

end

