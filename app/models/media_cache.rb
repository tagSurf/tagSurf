# Hand done media query caching
# Uses Redis, not memcached, for more customized
# collection caching

class MediaCache
  include Redis::Objects

  # Early benchmarks don't show improvements
  def self.fetch_public(limit=20, offset=0)
    m = MediaCache.new
    m.redis.lrange("media:public_feed", 0, -1)
  end 

end
