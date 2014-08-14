class EnqueueGenerateTagFeed
  include Sidekiq::Worker
  include Sidetiq::Schedulable

  recurrence { hourly.minute_of_hour(0, 15, 30, 45) }

  def perform
    GenerateTagFeed.perform_async('safe')
    GenerateTagFeed.perform_async('nsfw')
  end

end
