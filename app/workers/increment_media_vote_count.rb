class IncrementMediaVoteCount
  include Sidekiq::Worker

  def perform(media_id, vote_flag, weight)
    media = Media.find_by(id: media_id)
    weight ||= 1000000
    return unless media

    if vote_flag
      media.ts_score += weight
    else
      media.ts_score -= weight
    end

    media.last_touched = Time.now
    media.save
  end

end
