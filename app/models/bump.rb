class Bump < ActiveRecord::Base
  validates_presence_of :sharer_id
  validates_presence_of :referral_id
  validates_presence_of :media_id
  validates_presence_of :bumper_id
  validates_uniqueness_of :bumper_id, scope: [:sharer_id, :media_id], :message => "bump already made."

  belongs_to :user
  belongs_to :media
  belongs_to :referral 

  after_commit :create_vote,        on: :create
	after_commit :set_referral_flag, 	on: :create
  after_commit :send_notification,  on: :create
  after_commit :update_media_score, on: :create

  def self.bump_referral(id)
    @ref = Referral.unscoped.find(id)

    @bump = Bump.new(
          bumper_id: @ref.user_id,
          bumper_type: "User",
          referral_id: id,
          media_id: @ref.media_id,
          sharer_id: @ref.referrer_id,
          sharer_type: "User"
        )
    @success = @bump.save 

    @success

  end

  private 

  def set_referral_flag
  	ref = Referral.unscoped.find(self.referral_id)
    ref.update_column(:bumped, true)
    ref.update_column(:seen, true)
    UpdateBadgeIcon.perform_async(ref.user_id)
	end

  def create_vote
    user = User.find(self.bumper_id)
    user.voted_on << self.media_id
    if CONFIG[:redis_active]
      CreateBumpVote.perform_async(self.id)
    else
      vote = Vote.where(
        votable_id: self.media_id,
        votable_type: 'Media',
        voter_id: self.bumper_id,
        voter_type: 'User'
      ).first
      unless vote
        vote = Vote.create!(
          voter_id: self.bumper_id,
          voter_type: 'User',
          votable_id: self.media_id,
          votable_type: 'Media',
          vote_flag: true
        )
      end
    end
  end

  def send_notification
    SendBumpNotification.perform_async(self.referral_id)
  end

  def update_media_score
    IncrementMediaVoteCount.perform_async(self.media_id, true, 10000000)
  end

end
