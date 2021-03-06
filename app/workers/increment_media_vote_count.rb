class IncrementMediaVoteCount
  include Sidekiq::Worker

  def perform(media_id, vote_flag, weight=1000000)
    media = Media.find_by(id: media_id)
    return unless media

    if vote_flag
      media.up_votes.increment
      media.ts_score += weight
    else
      media.up_votes.decrement
      media.ts_score -= weight
    end

    media.last_touched = Time.now
    media.save
  end

end
