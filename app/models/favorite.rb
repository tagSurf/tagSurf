class Favorite < ActiveRecord::Base

  validates_presence_of :user_id
  validates_presence_of :resource_id

  belongs_to :user


  def self.paginated_history(user_id, limit, offset)
    Card.joins(:favorites).where("favorites.user_id = #{user_id}").order('favorites.id desc').limit(limit).offset(offset)
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

end
