class Referral < ActiveRecord::Base
  validates_presence_of :user_id
  validates_presence_of :referrer_id
  validates_presence_of :referrable_id
  validates_uniqueness_of :user_id, scope: [:referrer_id, :referrable_id], :message => "referral already made."

	default_scope { where(voted: false) }

  belongs_to :user
  belongs_to :media

  has_many :bumps, :foreign_key => :referral_id

  after_commit :find_vote, 	on: :create
  after_commit :send_notification, on: :create

  def self.paginated_collection(user_id, limit, offset, safe)
    if safe
      Media.joins(:referrals).where("referrals.referrer_id = #{user_id}").nsfw(false).order('referrals.id desc').limit(limit).offset(offset)
    else
      Media.joins(:referrals).where("referrals.referrer_id = #{user_id}").order('referrals.id desc').limit(limit).offset(offset)
    end
  end

  private 

  def find_vote
  	vote = Vote.where(voter_id: self.user_id).where(votable_id: self.referrable_id)
  	if !vote.empty?
  		self.update_column("voted", true)
  	end
	end

  def send_notification
    SendReferNotification.perform_async(self.id)
  end

end

