class Referral < ActiveRecord::Base
  validates_presence_of :user_id
  validates_presence_of :referrer_id
  validates_presence_of :referrable_id
  validates_uniqueness_of :user_id, :scope => :referrer_id, :scope => :referrable_id, :message => "content already referred to user."

  belongs_to :user
  belongs_to :media

end

