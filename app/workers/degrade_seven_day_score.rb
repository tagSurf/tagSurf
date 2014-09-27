class DegradeSevenDayScore 
  include Sidekiq::Worker
  include Sidetiq::Schedulable

  # 3am in PST
  recurrence { daily.hour_of_day(11) }

  def perform
    media = Media.select(
      :id, 
      :ts_score,  
      :created_at, 
      :time_bonus_expired
    ).where(
      'created_at < ? and 
      not time_bonus_expired', 
      7.days.ago
    )
    media.each do |m|
      leftover_time_bonus = m.created_at.to_i - 2 * (20000000)
      score = m.ts_score - leftover_time_bonus
      m.update_columns(time_bonus_expired: true, ts_score: score)
    end
  end

end
