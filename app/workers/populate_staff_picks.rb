class PopulateStaffPicks
  include Sidekiq::Worker

  def perform
    Media.tagged_with('StaffPicks').pluck(:id).each do |m| 
      Media.redis.sadd("media:staff_picks", m)
    end
  end

end
