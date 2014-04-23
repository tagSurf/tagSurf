class CardSerializer < ActiveModel::Serializer
  self.root = false

  attributes( 
    :id,
    :image_link_medium,
    :image_link_tiny,
    :image_link_original,
    :title, 
    :description,
    :tags,
    :user_stats,
    :total_votes,
    :down_votes,
    :up_votes,
    :score,
    :trend
  )

  def tags
    [object.section]
  end

  def image_link_medium
    if object.animated?
      object.image_link_original
    else 
      object.image_link_medium
    end
  end

  def user_stats
    h = {
      voted: true,
      vote: 'up',
      tag_voted: object.section
    }
    h
  end

  def votes
    @votes = Vote.where(votable_type: 'Card', votable_id: object.id) 
  end

  def total_votes
    object.remote_score.to_i + votes.length.to_i
  end

  def down_votes
    object.remote_down_votes.to_i + votes.where(vote_flag: false).count
  end

  def up_votes
    object.remote_up_votes.to_i + votes.where(vote_flag: true).count
  end

  def score
    object.remote_score
  end

  def trend
    [*1..10].sample.odd? ? 'up' : 'down'
  end

end
