class Referral < ActiveRecord::Base
  validates_presence_of :user_id
  validates_presence_of :referrer_id
  validates_presence_of :media_id
  validates_uniqueness_of :user_id, scope: [:referrer_id, :media_id], :message => "referral already made."

	default_scope { where(voted: false) }

  belongs_to :user
  belongs_to :media

  has_one :bump, :foreign_key => :referral_id

  after_commit :find_vote, 	on: :create
  after_commit :send_notification, on: :create

  
# Return referrals made BY a user
  def self.paginated_collection_made(user_id, limit, offset, safe)

    media_ids = Referral.unscoped.where(referrer_id: user_id).select(:media_id).order('created_at desc').map { |r| r.media_id }

    media_ids.uniq!

    if safe
      media = Media.where('not nsfw and media.id in (?)', media_ids).index_by(&:id).values_at(*media_ids)
    else
      media = Media.where('media.id in (?)', media_ids).index_by(&:id).values_at(*media_ids)
    end

    media.compact!

    media = media[offset..(offset+limit-1)]
    unless media.nil?
      media.each do |m|
        refs = Referral.unscoped.where(media_id: m.id, referrer_id: user_id).order('created_at desc').reverse
        m.referrals_list = Array.new
        refs.each do |r|
          m.referrals_list << {
            referral_id: r.id,
            user_id: r.user_id,
            username:  User.find(r.user_id).username ? 
                        User.find(r.user_id).username : User.find(r.user_id).email,
            profile_pic: User.find(r.user_id).profile_pic_link,
            bumped: r.bumped,
            seen: r.bump ? r.bump.seen : nil,
            bump_id: r.bump ? r.bump.id : nil,
            time: r.created_at
          }
        end
      end 
    end

    media

  end

# Return referrals made to a user
  def self.paginated_collection_received(user_id, limit, offset, safe)

    media_ids = Referral.unscoped.where(user_id: user_id).select(:media_id).order('created_at desc').map { |r| r.media_id }

    media_ids.uniq!

    if safe
      media = Media.unscoped.where('not nsfw and media.id in (?)', media_ids).index_by(&:id).values_at(*media_ids)
    else
      media = Media.unscoped.where('media.id in (?)', media_ids).index_by(&:id).values_at(*media_ids)
    end

    media.compact!

    media = media[offset..(offset+limit-1)]

    unless media.nil?
      media.each do |m|
        refs = Referral.unscoped.where(media_id: m.id, user_id: user_id).order('created_at desc')
        m.referrals_list = Array.new
        refs.each do |r|
          m.referrals_list << {
            referral_id: r.id,
            user_id: r.referrer_id,
            username:  User.find(r.referrer_id).username ? 
                        User.find(r.referrer_id).username : User.find(r.referrer_id).email,
            profile_pic: User.find(r.referrer_id).profile_pic_link,
            bumped: r.bumped,
            seen: r.seen,
            time: r.created_at
          }
        end
      end 
    end

    media

  end

  private 

  def find_vote
  	vote = Vote.where(voter_id: self.user_id).where(votable_id: self.media_id)
  	if !vote.empty?
  		self.update_column("voted", true)
  	end
	end

  def send_notification
    safe_mode = User.find(self.user_id).safe_mode
    nsfw = Media.find(self.media_id).nsfw
    if safe_mode && nsfw
      return
    else
      SendReferNotification.perform_async(self.id)
    end
  end

end

