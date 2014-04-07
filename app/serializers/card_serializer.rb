class CardSerializer < ActiveModel::Serializer
  self.root = false

  attributes( 
    :id,
    :image_link_medium,
    :image_link_tiny,
    :image_link_original,
    :title, 
    :description,
    :tagged_as,
    :user_vote,
    :total_votes,
    :down_votes,
    :up_votes,
    :remote_score
  )

  def tagged_as
    object.section
  end

  def user_vote
  end

  def favorite_id
    object.favorites.first.id
  end

  def total_votes
    #object.votes.size
  end

  def down_votes
    #object.upvotes.size
  end

  def up_votes
    #object.downvotes.size
  end

end
