class CardSerializer < ActiveModel::Serializer
  self.root = false

  attributes( 
    :id,
    :link,
    :title, 
    :description,
    :tagged_as,
    :user_vote,
    :total_votes,
    :down_votes,
    :up_votes
  )

  def tagged_as
    object.section
  end

  def user_vote
    current_user.likes(object) == true ? 'up' : 'down'
  end

  def total_votes
    object.votes.size
  end

  def down_votes
    object.upvotes.size
  end

  def up_votes
    object.downvotes.size
  end

end
