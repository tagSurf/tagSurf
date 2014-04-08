class TestWorker
  include Sidekiq::Worker

  def perform(name, number)
    puts "Test worker: #{name}, #{number} ... "
  end
end
