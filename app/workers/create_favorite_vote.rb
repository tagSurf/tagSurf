class CreateFavoriteVote
  include Sidekiq::Worker

  def perform(favorite_id)
    begin
      fav = Favorite.find(favorite_id)
      vote = Vote.where(
        votable_id: fav.card.id, 
        votable_type: 'Card', 
        voter_id: fav.user.id, 
        voter_type: 'User'
      ).first
      unless vote
        Vote.create!(
          voter_id: fav.user.id,
          voter_type: 'User',
          votable_id: fav.card.id,
          votable_type: 'Card',
          vote_flag: true
        )
      end
    rescue => e
      raise "Unable to create vote after favorite: #{e}"
    end
  end
end
