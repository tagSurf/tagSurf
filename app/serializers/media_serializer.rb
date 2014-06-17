class MediaSerializer < BaseSerializer
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

  def media
    @object ||= object
  end

  def tags
    [media.section]
  end

  def tags_v2
    # Fix this fiasco once client is set
    current_tags = (media.tag_list + media.tagged_as + [media.section]).uniq
    tagged_medias = []
    current_tags.each do |tag|
      tagged_medias.push("#{tag}" => media.media_tag_info(tag))
    end
    tagged_medias
  end

  def image
    img = {
      content_type: media.content_type,
      animated: media.animated?,
      tiny: {url: media.image_link_tiny, width: 50, height: 50}.merge!(media.scale_dimensions(160)),
      medium: {url: media.image_link_medium, width: 320, height: 320}.merge!(media.scale_dimensions(320)),
      large: {url: media.image_link_large, width: 640, height: 640}.merge!(media.scale_dimensions(640)),
      huge: {url: media.image_link_huge, width: 1024, height: 1024}.merge!(media.scale_dimensions(1024)),
      original: {url: media.image_link_original, width: media.width, height: media.height}
    }
    img
  end

  def user_vote
    @user_vote ||= Vote.where(voter_id: current_user.id, votable_id: media.id).first
  end

  def user_favorite
    @user_fav ||= Favorite.where(user_id: current_user.id, media_id: media.id).first
  end

  def caption
    if media.description
      media.description
    else
      media.title
    end 
  end

  def source
    media.remote_provider
  end

  def user_stats
    time = Time.now
    user = {
      has_voted: false, 
      has_favorited: user_favorite.present?, 
      vote: nil, 
      tag_voted: media.section,
      time_discovered: "#{time_ago_in_words(time)} ago",
      time_favorited: nil
    }

    if user_vote.present?
      user[:has_voted] = true
      user[:vote] =  user_vote.try(:vote_flag) ? 'up' : 'down'
      user[:time_discovered] = "#{time_ago_in_words(user_vote.created_at)} ago"
    end

    if user_favorite.present?
      user[:time_favorited] = "#{time_ago_in_words(user_favorite.created_at)} ago"
    end

    user 
  end

  def votes
    @votes = Vote.where(votable_type: 'Media', votable_id: media.id) 
  end

  def total_votes
    media.remote_score.to_i + votes.length.to_i
  end

  def down_votes
    media.remote_down_votes.to_i + votes.where(vote_flag: false).count
  end

  def up_votes
    media.remote_up_votes.to_i + votes.where(vote_flag: true).count
  end

  def score
    media.remote_score
  end

  def trend
    [*1..10].sample.odd? ? 'up' : 'down'
  end

end
