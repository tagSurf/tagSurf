class SendLeaderboardMailer
  include Sidekiq::Worker
  include Sidetiq::Schedulable

  recurrence { weekly.day(:monday).hour_of_day(15).minute_of_hour(30) }
  
  def perform
  	LeaderboardMailer.perform_async()
  end

end