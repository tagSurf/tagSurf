class MediaSerializer < BaseSerializer
  self.root = false

  attributes( 
    :id,
    :remote_id,
    :source,
    :image,
    :caption, 
    :tags,
    :web_link,
    :deep_link,
    :source_icon,
    :user_stats,
    :permissions,
    :total_votes,
    :down_votes,
    :up_votes,
    :score,
    :type,
    :trend,
    :referral
  )

  def media
    @object ||= object
  end

  def type
    return "login" if media.ts_type == 'login'
    return "friend_request" if media.ts_type == 'friend_request'
    unless media.remote_provider.include?('urx')
      return media.ts_type
    end

    if CONFIG[:web_domains].include?(media.remote_provider.split('/')[1])
      return "content/web"
    end
  
    media.ts_type
  end

  def permissions
    perms = {}
    perms[:votable] = true
    if current_user.nil? || type == 'login' || type == 'friend_request'
      perms[:votable] = false
    end
    perms
  end

  def tags
    return [] if !type.include?('content')
    current_tags = (media.tag_list + media.tagged_as).uniq
    if current_user.try(:safe_mode)
      current_tags.delete_if { |tag| Tag.blacklisted?([tag.to_s]) }
    end
    tagged_medias = []
    current_tags.each do |tag|
      tagged_medias.push("#{tag}" => media.media_tag_info(tag))   
    end
    tagged_medias
  end

  def image
    return {} if !type.include?('content')
    if media.remote_provider == 'imgur'
      img = {
        content_type: media.content_type,
        animated: media.animated?,
        tiny: {url: media.image_link_tiny, width: 50, height: 50}.merge!(media.scale_dimensions(160)),
        medium: {url: media.image_link_medium, width: 320, height: 320}.merge!(media.scale_dimensions(320)),
        large: {url: media.image_link_large, width: 640, height: 640}.merge!(media.scale_dimensions(640)),
        huge: {url: media.image_link_huge, width: 1024, height: 1024}.merge!(media.scale_dimensions(1024)),
        original: {url: media.image_link_original, width: media.width, height: media.height}
      }
    elsif media.remote_provider.include?('urx')
      img = {
        content_type: media.content_type,
        animated: media.animated?,
        large: {url: media.image_link_large},
        huge: {url: media.image_link_huge},
        original: {url: media.image_link_original}
      }
    end
    img
  end

  def user_vote
    return nil if !type.include?('content')
    @user_vote ||= Vote.where(voter_id: current_user.try(:id), votable_id: media.id).first
  end

  def user_favorite
    return nil if !type.include?('content')
    @user_fav ||= Favorite.where(user_id: current_user.try(:id), media_id: media.id).first
  end

  def caption
    return nil if !type.include?('content')
    case media.remote_provider
    when 'imgur'
      media.description ? media.description : media.title
    when 'urx/pinterest'
      media.description ? media.description : media.title
    when 'urx/engadget'
      media.description ? media.description : media.title
    when 'urx/cbs'
      media.description ? media.description : media.title
    when 'urx/flipboard'
      media.description ? media.description : media.title
    else
      media.title
    end 
  end

  def source
    return nil if !type.include?('content')
    media.remote_provider
  end

  def user_stats
    return media.friend if type == 'friend_request'
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
    return nil if !type.include?('content')
    @votes = Vote.where(votable_type: 'Media', votable_id: media.id) 
  end

  def total_votes
    return nil if !type.include?('content')
    media.remote_score.to_i + votes.length.to_i
  end

  def down_votes
    return nil if !type.include?('content')
    media.remote_down_votes.to_i + votes.where(vote_flag: false).count
  end

  def up_votes
    return nil if !type.include?('content')
    media.remote_up_votes.to_i + votes.where(vote_flag: true).count
  end

  def score
    return nil if !type.include?('content')
    media.remote_score
  end

  def source_icon
    return nil if !type.include?('content')
    if media.remote_provider.include?('urx')
      media.deep_link_icon
    elsif media.remote_provider == 'imgur'
      "http://assets.tagsurf.co/img/imgur_icon.png"
    end
  end

  def web_link
    return media.web_link unless media.remote_provider == 'imgur'
    return "http://imgur.com/gallery/#{media.remote_id}"
  end

  def trend
    return nil if !type.include?('content')
    [*1..10].sample.odd? ? 'up' : 'down'
  end

  def referral
    if media.referrals_list
      media.referrals_list.each do |r|
        r[:time] = "#{time_ago_in_words(r[:time])} ago"
      end
      media.referrals_list
    else 
      return nil if !current_user
      referrals = Referral.unscoped.where(media_id: media.id, user_id: current_user.id)
      return nil if referrals.empty?
      ref = Array.new
      referrals.each do |r|
        ref << {
          referral_id: r.id,
          user_id: r.referrer_id,
          username: User.find(r.referrer_id).username ? 
                      User.find(r.referrer_id).username : User.find(r.referrer_id).email,
          profile_pic: User.find(r.referrer_id).profile_pic_link,
          bumped: r.bumped,
          seen: r.seen        
        }
      end
      ref
    end
  end

end
