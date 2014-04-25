class TaggedMediaPopulation
  include Sidekiq::Worker
  include Sidetiq::Schedulable

  recurrence { hourly.minute_of_hour(5, 20, 35, 50) }

  def perform
    batch = Tag.where(fetch_more_content: true).limit(25)
    if batch.present?
      batch.each do |tag|
        Card.populate_tag(tag.name)
        tag.update_column("fetch_more_content", false)
      end
    else
      Tag.update_all(fetch_more_content: true)
    end
  end
end
