# Custom media query caching
# Utilize benchmarks to confirm fastest data lookup
# >> Benchmark.ms { # ... expression }

class MediaCache
  include ActiveModel::Model
  include Redis::Objects

  # Benchmarks not showing improvements
  def self.fetch_public(limit=20, offset=0)
    m = MediaCache.new
    m.redis.lrange("media:public_feed", 0, -1)
  end 

  # 20k indexed vote lookups is slower in Redis than Postgres
  # MediaCache.vote_history #=> 300 - 500ms
  # user.votes.pluck(:votable_id) #=> 70 - 200ms
  def self.vote_history(user)
    user.votes.pluck(:votable_id) 
    # votes = Media.redis.smembers("user:#{user.id}:vote_history").collect { |v| v.to_i }
    #if votes.empty?
    #  votes = user.votes.pluck(:votable_id) 
    #  PopulateUserVoteHistory.perform_async(user.id)
    #end
    #votes
  end

  def self.staff_picks
    media_ids = Media.redis.smembers("media:staff_picks").collect {|v| v.to_i } 
    if media_ids.empty?
      media_ids = Media.tagged_with('StaffPicks').pluck(:id) 
      PopulateStaffPicks.perform_async
    end
    media_ids
  end

  # 20k viral records is slower in Redis than Postgres
  # MediaCache.viral_media_ids #=> 250 - 350ms
  # Media.where(viral: true, nsfw: false).pluck(:id) #=> 80 - 150ms
  def self.viral_media_ids
    Media.where(viral: true, nsfw: false).pluck(:id)
    #media_ids = Media.redis.smembers("media:viral_feed")#.collect {|v| v.to_i } 
    #if media_ids.empty?
    #  media_ids = Media.where(viral: true, nsfw: false).pluck(:id)
    #  PopulateViralMedia.perform_async
    #end
    #media_ids
  end

end
