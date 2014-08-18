class PopulateUserVoteHistory
  include Sidekiq::Worker

  def perform(user_id)
    user = User.find user_id
    if user
      user.votes.pluck(:votable_id).each do |id|
        Media.redis.sadd("user:#{user_id}:vote_history", id)
      end
    end
  end

end
