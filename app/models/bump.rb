class Bump < ActiveRecord::Base
  validates_presence_of :sharer_id
  validates_presence_of :referral_id
  validates_presence_of :media_id
  validates_presence_of :bumper_id
  validates_uniqueness_of :sharer_id, scope: [:sharer_id, :media_id], :message => "bump already made."

  belongs_to :user
  belongs_to :media
  belongs_to :referral 

	after_commit :bump_referral, 	on: :create

  private 

  def bump_referral
  	Referral.unscoped.find(self.referral_id).update_column(:bumped, true)
	end

end
