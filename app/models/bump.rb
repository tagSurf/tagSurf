class Bump < ActiveRecord::Base
  validates_presence_of :sharer_id
  validates_presence_of :referral_id
  validates_presence_of :media_id
  validates_presence_of :bumper_id
  validates_uniqueness_of :sharer_id, scope: [:sharer_id, :media_id], :message => "bump already made."

  belongs_to :user
  belongs_to :media
  belongs_to :referral 

	after_commit :set_referral_flag, 	on: :create

  def bump_referral(id)
    @ref = Referral.unscoped.find(id)
    @bump = Bump.new(
          bumper_id: @ref.user_id,
          bumper_type: "User",
          referral_id: id,
          media_id: @ref.referrable_id,
          sharer_id: @ref.referrer_id,
          sharer_type: "User"
        )
    @success = @bump.save 

    if @success
      SendBumpNotification.perform_async(id)
    end

    @success

  end

  private 

  def set_referral_flag
  	Referral.unscoped.find(self.referral_id).update_column(:bumped, true)
	end

end
