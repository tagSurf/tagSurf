class IncrementMediaVoteCount
  include Sidekiq::Worker

  def perform(media_id)
    card = Card.find_by(id: media_id)
    return unless card
    card.up_votes.increment
    card.ts_score = card.ts_score + 1000000
    card.save
  end

end
