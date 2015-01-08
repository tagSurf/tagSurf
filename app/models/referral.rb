class Referral < ActiveRecord::Base
  validates_presence_of :user_id
  validates_presence_of :referrer_id
  validates_presence_of :referrable_id
  validates_uniqueness_of :user_id, :scope => :referrer_id, :scope => :referrable_id, :message => "referral already made."

  belongs_to :user
  belongs_to :media

  after_commit :find_vote, 	on: :create

  private 

  def find_vote
  	votes = Vote.where(voter_id: self.user_id).where(votable_id: self.referrable_id)
  	if !votes.empty?
  		self.update_column("voted", true)
  	end
	end

end

