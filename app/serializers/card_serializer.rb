class CardSerializer < ActiveModel::Serializer
  self.root = false

  attributes( 
    :id,
    :image,
    :caption, 
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

  def image
    h = {
      content_type: object.content_type,
      animated: object.animated?,
      tiny:   {url: object.image_link_tiny, width: 50, height: 50},
      medium: {url: object.image_link_medium, width: 320, height: 320},
      original: {url: object.image_link_original, width: object.width, height: object.height}
    }
    h
  end

  def caption
    if object.description
      object.description
    else
      object.title
    end 
  end

  def source
    object.remote_provider
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
