class IncrementMediaVoteCount
  include Sidekiq::Worker

  def perform(media_id, vote_flag)
    media = Media.find_by(id: media_id)
    return unless media

    if vote_flag
      media.up_votes.increment
      media.ts_score += 1000
    else
      media.up_votes.decrement
      media.ts_score -= 1000
    end

    media.last_touched = Time.now
    media.save
  end

end
