class Vote < ActiveRecord::Base
  self.table_name = 'votes'

  belongs_to :user, :foreign_key => :voter_id
  belongs_to :card, :foreign_key => :votable_id

  def self.paginated_history(user_id, limit, offset) 
    Card.joins(:votes).where("votes.voter_id = #{user_id}").order('votes.id desc').limit(limit).offset(offset)
  end

  def next_ten_cards
    cards = []
    user.votes.includes(:card).where("votes.id > ?", id).order("id ASC").limit(2).each {|v| cards << v.card }
    cards
  end

  def prev_ten_cards
    cards = []
    user.votes.includes(:card).where("votes.id < ?", id).order("id DESC").limit(2).each {|v| cards << v.card }
    cards
  end

  # Places the requested card in the center of a collection of 21 cards
  # [previous 10 cards voted] + [requested card] + [next 10 votes]
  def self.bracketed_collection(vote)
    collection = []
    collection << vote.next_ten_cards.reverse!
    collection << vote.card
    collection << vote.prev_ten_cards
    collection.flatten
  end

end
