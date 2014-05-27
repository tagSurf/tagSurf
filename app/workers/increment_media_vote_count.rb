class IncrementMediaVoteCount
  include Sidekiq::Worker

  def perform(media_id)
    media = Media.find_by(id: media_id)
    return unless card
    media.up_votes.increment
    media.ts_score = media.ts_score + 1000000
    media.last_touched = Time.now
    media.save
  end

end
