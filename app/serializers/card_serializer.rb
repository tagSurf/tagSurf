class CardSerializer < BaseSerializer
  self.root = false

  attributes( 
    :id,
    :image,
    :caption, 
    :tags,
    :tags_v2,
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

  def tags_v2
    # Fix this fiasco once client is set
    current_tags = (object.tag_list + object.tagged_as + object.section).uniq
    tagged_objects = []
    current_tags.each do |tag|
      tagged_objects.push("#{tag}" => object.card_tag_info(tag))
    end
    tagged_objects
  end

  def image
    img = {
      content_type: object.content_type,
      animated: object.animated?,
      tiny: {url: object.image_link_tiny, width: 50, height: 50}.merge!(object.scale_dimensions(160)),
      medium: {url: object.image_link_medium, width: 320, height: 320}.merge!(object.scale_dimensions(320)),
      large: {url: object.image_link_large, width: 640, height: 640}.merge!(object.scale_dimensions(640)),
      huge: {url: object.image_link_huge, width: 1024, height: 1024}.merge!(object.scale_dimensions(1024)),
      original: {url: object.image_link_original, width: object.width, height: object.height}
    }
    img
  end

  def user_vote
    @user_vote ||= Vote.where(voter_id: current_user.id, votable_id: object.id).first
  end

  def user_favorite
    @user_fav ||= Favorite.where(user_id: current_user.id, card_id: object.id).first
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
    time = Time.now
    user = {
      has_voted: false, 
      has_favorited: user_favorite.present?, 
      vote: nil, 
      tag_voted: object.section,
      time_discovered: "#{time_ago_in_words(time)} ago"
    }

    if user_vote.present?
      user[:has_voted] = true
      user[:vote] =  user_vote.try(:vote_flag) ? 'up' : 'down'
      user[:time_discovered] = "#{time_ago_in_words(user_vote.created_at)} ago"
    end

    user 
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
