class Vote < ActiveRecord::Base
  self.table_name = 'votes'

  belongs_to :card
  belongs_to :user

  def self.paginated_history(user_id, limit, offset) 
    #ActsAsVotable::Vote.includes(:votable).where(voter_id: user_id).order('updated_at desc').limit(limit).offset(offset).collect(&:votable)
    Card.joins(:votes).where("votes.voter_id = #{user_id}").order('votes.id desc').limit(limit).offset(offset)
  end

end
