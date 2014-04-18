class Vote < ActiveRecord::Base
  self.table_name = 'votes'

  belongs_to :user, :foreign_key => :voter_id
  belongs_to :card, :foreign_key => :votable_id
  has_one :tag

  after_commit :relate_tag, on: :create

  def self.paginated_history(user_id, limit, offset) 
    Card.joins(:votes).where("votes.voter_id = #{user_id}").order('votes.id desc').limit(limit).offset(offset)
  end

  def prev_cards(n=2)
    cards = []
    user.votes.includes(:card).where("votes.id > ?", id).order("id ASC").limit(n).each {|v| cards << v.card }
    cards
  end

  def next_cards(n=2)
    cards = []
    user.votes.includes(:card).where("votes.id < ?", id).order("id DESC").limit(n).each {|v| cards << v.card }
    cards
  end

  # Places the requested card in the center of a collection of 21 cards
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
    tag = Tag.where(name: self.cached_tag_name).first
    self.update_column("tag_id", tag.id)
  end
    
end
