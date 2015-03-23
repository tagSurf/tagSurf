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
      :created_at => 6.days.ago..7.days.ago
    ).where(
     :time_bonus_expired => false
    )
    media.each do |m|
      score_bonus = m.remote_score.to_i + (m.up_votes.to_i * 1000000) + 
        ((m.favorites.count + m.bumps.count) * 10000000)
      m.update_columns(time_bonus_expired: true, ts_score: score_bonus)
    end
  end

end
