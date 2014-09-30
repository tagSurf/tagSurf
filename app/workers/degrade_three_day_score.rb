class DegradeThreeDayScore 
  include Sidekiq::Worker
  include Sidetiq::Schedulable

  # 2am in PST
  recurrence { daily.hour_of_day(10) }

  def perform
    media = Media.select(:id, :ts_score).where(created_at: 3.days.ago..Time.now)
    media.each do |m|
      score = m.ts_score - 50000000
      m.update_column('ts_score', score)
    end
  end

end
