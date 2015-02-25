class Bump < ActiveRecord::Base
  validates_presence_of :sharer_id
  validates_presence_of :referral_id
  validates_presence_of :media_id
  validates_presence_of :bumper_id
  validates_uniqueness_of :sharer_id, scope: [:sharer_id, :media_id], :message => "bump already made."

  belongs_to :user
  belongs_to :media
  belongs_to :referral 

  # after_commit :find_vote, 	on: :create

  private 

  def find_vote
  	vote = Vote.where(voter_id: self.user_id).where(votable_id: self.referrable_id)
  	if !vote.empty?
  		self.update_column("voted", true)
  	end
	end

end
