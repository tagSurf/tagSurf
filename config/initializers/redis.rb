# localhost here so that it doesn't break during production precompile 
# http://stackoverflow.com/questions/13859053/how-to-test-my-production-config-locally-when-it-uses-redistogo-on-heroku
uri = URI.parse(ENV['OPENREDIS_URL'] || "redis://127.0.0.1:6379/")
$redis = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)
