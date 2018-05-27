class MediaPopulation
  include Sidekiq::Worker
  include Sidetiq::Schedulable

  recurrence { daily.hour_of_day(5, 10, 15) }

  def perform
    Media.populate_trending!
  end
end
