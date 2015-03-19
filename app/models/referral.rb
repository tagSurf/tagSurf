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
    media = Array.new
    @offset = offset
    @limit = limit

    # Get media ids and de-dupe collection
    while media.length < limit do
      if !media.empty?
        @limit = limit - media.length
      end

      referrals = Referral.unscoped.where(referrer_id: user_id).order('created_at desc').limit(@limit).offset(@offset)

      if referrals.empty?
        break
      end

      referrals.each do |ref|
        next if safe && ref.media.nsfw
        media << ref.media
      end
      
      media.uniq!

      if @limit == limit
        @offset = offset + media.length
      else
        @offset = @offset + @limit
      end
    end

    media.each do |m|
      refs = Referral.unscoped.where(media_id: m.id, referrer_id: user_id)
      m.referrals = Array.new
      refs.each do |r|
        m.referrals << {
          referral_id: r.id,
          user_id: r.user_id,
          username:  User.find(r.user_id).username ? 
                      User.find(r.user_id).username : User.find(r.user_id).email,
          bumped: r.bumped,
          seen: r.bump ? r.bump.seen : nil,
          bump_id: r.bump ? r.bump.id : nil,
          time: r.created_at
        }
      end
    end 

    media

  end

# Return referrals made to a user
  def self.paginated_collection_received(user_id, limit, offset, safe)
    media = Array.new
    @offset = offset
    @limit = limit

    # Get media ids and de-dupe collection
    while media.length < limit do
      if !media.empty?
        @limit = limit - media.length
      end

      referrals = Referral.unscoped.where(user_id: user_id).order('created_at desc').limit(@limit).offset(@offset)

      if referrals.empty?
        break
      end

      referrals.each do |ref|
        next if safe && ref.media.nsfw
        media << ref.media
      end
      
      media.uniq!

      if @limit == limit
        @offset = offset + media.length
      else
        @offset = @offset + @limit
      end
    end

    media.each do |m|
      refs = Referral.unscoped.where(media_id: m.id, user_id: user_id)
      m.referrals = Array.new
      refs.each do |r|
        m.referrals << {
          referral_id: r.id,
          user_id: r.referrer_id,
          username:  User.find(r.referrer_id).username ? 
                      User.find(r.referrer_id).username : User.find(r.referrer_id).email,
          bumped: r.bumped,
          seen: r.seen,
          time: r.created_at
        }
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
    SendReferNotification.perform_async(self.id)
  end

end

