class Favorite < ActiveRecord::Base

  validates_presence_of :user_id
  validates_presence_of :card_id
  validates_uniqueness_of :card_id, :scope => :user_id, :message => "already favorited by user."

  belongs_to :user
  belongs_to :card


  def self.paginated_history(user_id, limit, offset)
    Card.joins(:favorites).where("favorites.user_id = #{user_id}").order('favorites.id desc').limit(limit).offset(offset)
  end

  def prev_cards(n=2)
    cards = []
    user.favorites.includes(:card).where("favorites.id < ?", id).order("id DESC").limit(n).each {|v| cards << v.card }
    cards
  end

  def next_cards(n=2)
    cards = []
    user.favorites.includes(:card).where("favorites.id > ?", id).order("id ASC").limit(n).each {|v| cards << v.card }
    cards
  end

  # Places the requested card in the center of a collection of 21 cards
  # [previous 10 cards voted] + [requested card] + [next 10 votes]
  def self.bracketed_collection(favorite)
    collection = []
    collection << favorite.next_cards.reverse!
    collection << favorite.card
    collection << favorite.prev_cards
    collection.flatten
  end

  def self.next_collection(favorite)
    favorite.next_cards(10).reverse!- [favorite.card]
  end

  def self.previous_collection(favorite)
    favorite.prev_cards(10) - [favorite.card]
  end

end
