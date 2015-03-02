class Referral < ActiveRecord::Base
  validates_presence_of :user_id
  validates_presence_of :referrer_id
  validates_presence_of :media_id
  validates_uniqueness_of :user_id, scope: [:referrer_id, :media_id], :message => "referral already made."

	default_scope { where(voted: false) }

  belongs_to :user
  belongs_to :media

  has_many :bumps, :foreign_key => :referral_id

  after_commit :find_vote, 	on: :create
  after_commit :send_notification, on: :create

  
# Return referrals made BY a user
  def self.paginated_collection(user_id, limit, offset, safe, prev_keys = nil)
    known_keys = prev_keys ? prev_keys : Array.new
    media_ids = Array.new
    @offset = offset
    @limit = limit

    # Get media ids and de-dupe collection
    while media_ids.length < limit do
      if !media_ids.empty?
        @limit = limit - media_ids.length
      end

      if !known_keys.empty?
        keys = Referral.unscoped.select(:media_id, :created_at, :referrer_id).where(referrer_id: user_id).where("referrals.media_id not in (?)", known_keys).order('created_at desc').limit(@limit).offset(@offset)
      else
        keys = Referral.unscoped.select(:media_id, :created_at, :referrer_id,).where(referrer_id: user_id).order('created_at desc').limit(@limit).offset(@offset)
      end

      if keys.empty?
        break
      end

      keys.each do |ref|
        media_ids << ref.media_id
        known_keys << ref.media_id
      end
      
      media_ids.uniq!
      known_keys.uniq!

      if @limit == limit
        @offset = offset + media_ids.length
      else
        @offset = @offset + @limit
      end
    end

    if safe
      media = Media.unscoped.joins(:referrals).where("media.id in (?)", media_ids).nsfw(false).order('referrals.created_at desc')
    else
      media = Media.unscoped.joins(:referrals).where("media.id in (?)", media_ids).order('referrals.created_at desc')
    end

    # media.each do |m|
    #   m.referrals = Array.new

    #   refs = Referral.unscoped.select(:id, :referrer_id, :media_id).where(referrer_id: user_id).where(media_id: m.id).order('created_at desc')

    #   refs.each do |ref|
    #     m.referrals << ref.id
    #   end
    # end

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
    SendReferNotification.perform_async(self.id)
  end

end

