class MediaSerializer < BaseSerializer
  self.root = false

  attributes( 
    :id,
    :remote_id,
    :image,
    :caption, 
    :tags,
    :tags_v2,
    :user_stats,
    :permissions,
    :total_votes,
    :down_votes,
    :up_votes,
    :score,
    :type,
    :trend
  )

  def media
    @object ||= object
  end

  def type
    media.ts_type
  end

  def permissions
    perms = {}
    perms[:votable] = true
    if current_user.nil? || type == 'login'
      perms[:votable] = false
    end
    perms
  end

  def tags
    return [] if type == 'login'
    [media.section]
  end

  def tags_v2
    return [] if type == 'login'
    # Fix this fiasco once client is set
    current_tags = (media.tag_list + media.tagged_as).uniq
    if current_user.try(:safe_mode)
      current_tags.delete_if { |tag| Tag.blacklisted?(tag.to_s) }
    end
    tagged_medias = []
    current_tags.each do |tag|
      tagged_medias.push("#{tag}" => media.media_tag_info(tag))   
    end
    tagged_medias
  end

  def image
    return {} if type == 'login'
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
    return nil if type == 'login'
    @user_vote ||= Vote.where(voter_id: current_user.try(:id), votable_id: media.id).first
  end

  def user_favorite
    return nil if type == 'login'
    @user_fav ||= Favorite.where(user_id: current_user.try(:id), media_id: media.id).first
  end

  def caption
    return nil if type == 'login'
    if media.description
      media.description
    else
      media.title
    end 
  end

  def source
    return nil if type == 'login'
    media.remote_provider
  end

  def user_stats
    return nil if type == 'login'
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
    return nil if type == 'login'
    @votes = Vote.where(votable_type: 'Media', votable_id: media.id) 
  end

  def total_votes
    return nil if type == 'login'
    media.remote_score.to_i + votes.length.to_i
  end

  def down_votes
    return nil if type == 'login'
    media.remote_down_votes.to_i + votes.where(vote_flag: false).count
  end

  def up_votes
    return nil if type == 'login'
    media.remote_up_votes.to_i + votes.where(vote_flag: true).count
  end

  def score
    return nil if type == 'login'
    media.remote_score
  end

  def trend
    return nil if type == 'login'
    [*1..10].sample.odd? ? 'up' : 'down'
  end

  

end
