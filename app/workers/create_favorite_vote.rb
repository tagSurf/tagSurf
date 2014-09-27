class CreateFavoriteVote
  include Sidekiq::Worker

  def perform(favorite_id)
    begin
      fav = Favorite.find(favorite_id)
      vote = Vote.where(
        votable_id: fav.media_id, 
        votable_type: 'Media', 
        voter_id: fav.user_id, 
        voter_type: 'User'
      ).first
      unless vote
        Vote.create!(
          voter_id: fav.user_id,
          voter_type: 'User',
          votable_id: fav.media_id,
          votable_type: 'Media',
          vote_flag: true
        )
      end
    if vote
      IncrementMediaVoteCount.perform_async(fav.media_id, vote.vote_flag, 10000000)
    end
    rescue => e
      raise "Unable to create vote after favorite: #{e}"
    end
  end
end
