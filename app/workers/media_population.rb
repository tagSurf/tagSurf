class MediaPopulation
  include Sidekiq::Worker
  include Sidetiq::Schedulable

  recurrence { hourly.minute_of_hour(0, 15, 30, 45) }

  def perform
    Media.populate_trending!
  end
end
