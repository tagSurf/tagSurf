class Favorite < ActiveRecord::Base

  validates_presence_of :user_id
  validates_presence_of :media_id
  validates_uniqueness_of :media_id, :scope => :user_id, :message => "already favorited by user."

  belongs_to :user
  belongs_to :media

  after_commit :create_vote, on: :create
  after_commit :downgrade_vote, on: :destroy

  def self.paginated_history(user_id, limit, offset, safe)
    if safe
      Media.joins(:favorites).where("favorites.user_id = #{user_id}").nsfw(false).order('favorites.id desc').limit(limit).offset(offset)
    else
      Media.joins(:favorites).where("favorites.user_id = #{user_id}").order('favorites.id desc').limit(limit).offset(offset)
    end
  end

  def prev_cards(n=2)
    media = []
    user.favorites.includes(:media).where("favorites.id < ?", id).order("id DESC").limit(n).each {|v| media << v.media }
    media
  end

  def next_cards(n=2)
    media = []
    user.favorites.includes(:media).where("favorites.id > ?", id).order("id ASC").limit(n).each {|v| media << v.media }
    media
  end

  # Places the requested card in the center of a collection of 21 cards
  # [previous 10 cards voted] + [requested card] + [next 10 votes]
  def self.bracketed_collection(favorite)
    collection = []
    collection << favorite.next_cards.reverse!
    collection << favorite.media
    collection << favorite.prev_cards
    collection.flatten
  end

  def self.next_collection(favorite)
    favorite.next_cards(10).reverse!- [favorite.card]
  end

  def self.previous_collection(favorite)
    favorite.prev_cards(10) - [favorite.card]
  end

  private

  def create_vote
    user = User.find(self.user_id)
    user.voted_on << self.media_id
    if CONFIG[:redis_active]
      CreateFavoriteVote.perform_async(self.id)
    else
      vote = Vote.where(
        votable_id: self.media_id,
        votable_type: 'Media',
        voter_id: self.user_id,
        voter_type: 'User'
      ).first
      unless vote
        vote = Vote.create!(
          voter_id: self.user_id,
          voter_type: 'User',
          votable_id: self.media_id,
          votable_type: 'Media',
          vote_flag: true
        )
      end
      if vote 
        IncrementMediaVoteCount.perform_async(self.media_id, true, 10000000)
      end
    end
  end

  def downgrade_vote
    IncrementMediaVoteCount.perform_async(self.media_id, false, 10000000)
  end

end
