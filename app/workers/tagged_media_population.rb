class TaggedMediaPopulation
  include Sidekiq::Worker
  include Sidetiq::Schedulable

  sidekiq_options :retry =>  3

  recurrence { daily.hour_of_day(6, 12, 18) }

  def perform
    batch = Tag.where(fetch_more_content: true).limit(25)
    if batch.present?
      batch.each do |tag|
        Media.populate_tag(tag.name)
        tag.update_column("fetch_more_content", false)
      end
    else
      Tag.update_all(fetch_more_content: true)
    end
  end
end
