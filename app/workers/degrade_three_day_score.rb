class DegradeThreeDayScore 
  include Sidekiq::Worker
  include Sidetiq::Schedulable

  # 2am in PST
  recurrence { daily.hour_of_day(10) }

  def perform
    media = Media.select(:id, :ts_score, :remote_score, :created_at).where(created_at: 3.days.ago..Time.now)
    media.each do |m|
      time_bonus = m.created_at.to_i - 200000000
      score_bonus = m.remote_score.to_i + (m.up_votes.to_i * 1000000)
      m.update_column('ts_score',  time_bonus + score_bonus)
    end
  end

end
