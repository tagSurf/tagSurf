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

  private 

  def find_vote
  	vote = Vote.where(voter_id: self.user_id).where(votable_id: self.referrable_id)
  	if !vote.empty?
  		self.update_column("voted", true)
  	end
	end

end

