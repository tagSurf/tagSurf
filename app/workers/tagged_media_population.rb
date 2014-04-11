class TaggedMediaPopulation
  include Sidekiq::Worker

  def perform(tag)
    Card.populate_tag(tag)
  end
end
