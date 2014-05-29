class DegradeSevenDayScore 
  include Sidekiq::Worker
  include Sidetiq::Schedulable

  # 3am in PST
  recurrence { daily.hour_of_day(11) }

  def perform
    media = Media.select(
      :id, 
      :ts_score, 
      :remote_score, 
      :created_at, 
      :time_bonus_expired
    ).where(
      'created_at < ? and 
      not time_bonus_expired', 
      7.days.ago
    )
    media.each do |m|
      if m.up_votes.to_i > 0
        score_bonus = m.remote_score.to_i + (m.up_votes.to_i * 1000000)
      else
        score_bonus = m.remote_score.to_i
      end
      m.update_columns(time_bonus_expired: true, ts_score: score_bonus)
    end
  end

end
