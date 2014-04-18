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
    :tags
    :user_stats,
    :total_votes,
    :down_votes,
    :up_votes,
    :score,
    :trend
  )

  def tagged_as
    [object.section]
  end

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
    {
      voted: true,
      vote: 'up',
      last_tag_voted: 'sometag'
    }
  end

  def votes
    @votes = Votes.where(votable_type: 'Card', votable_id: object.id) 
  end

  def total_votes
    object.remote_score.to_s + votes.length.to_s
  end

  def down_votes
    object.remote_down_votes.to_s + votes.where(vote_flag: false).count.to_s
  end

  def up_votes
    object.remote_up_votes.to_s + votes.where(vote_flag: false).count.to_s
  end

  def score
    object.remote_score
  end

  def trend
    [*1..10].sample.odd? ? 'up' : 'down'
  end

end
