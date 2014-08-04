class Vote < ActiveRecord::Base
  self.table_name = 'votes'

  belongs_to :user, :foreign_key => :voter_id
  belongs_to :card, :foreign_key => :votable_id
  has_one :tag

  after_commit :relate_tag,        on: :create
  after_commit :update_tag_feed,   if: :persisted?

  def self.paginated_history(user_id, limit, offset, safe) 
    if safe
      Media.joins(:votes).where("votes.voter_id = #{user_id} and media.nsfw = false").order('votes.id desc').limit(limit).offset(offset)
    else
      Media.joins(:votes).where("votes.voter_id = #{user_id}").order('votes.id desc').limit(limit).offset(offset)
    end
  end

  def prev_cards(n=2)
    media = []
    user.votes.includes(:media).where("votes.id > ?", id).order("id ASC").limit(n).each {|v| media  << v.media }
    media
  end

  def next_cards(n=2)
    media = []
    user.votes.includes(:media).where("votes.id < ?", id).order("id DESC").limit(n).each {|v| media << v.media }
    media
  end

  # Places the requested card in the center of a collection of 5 cards
  # [previous 10 cards voted] + [requested card] + [next 10 votes]
  def self.bracketed_collection(vote)
    collection = []
    collection << vote.prev_cards.reverse!
    collection << vote.card
    collection << vote.next_cards
    collection.flatten
  end

  def self.next_collection(vote)
    vote.next_cards(10) - [vote.card]
  end

  def self.previous_collection(vote)
    vote.prev_cards(10).reverse! - [vote.card]
  end

  private

  def relate_tag
    tag = Tag.where(name: self.vote_tag).first
    self.update_column("tag_id", tag.id)
  end

  def update_tag_feed
    tag = Tag.where(name: self.vote_tag).first
    if tag.blacklisted?
      tag.nsfw_tag_feed[tag.name] = Vote.where(vote_tag: tag.name).count
    else
      tag.nsfw_tag_feed[tag.name] = Vote.where(vote_tag: tag.name).count
      tag.safe_tag_feed[tag.name] = Vote.where(vote_tag: tag.name).count
    end
  end
   
end
