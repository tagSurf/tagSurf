class CreateFavoriteVote
  include Sidekiq::Worker

  def perform(favorite_id)
    begin
      fav = Favorite.find(favorite_id)
      vote = Vote.create!(
        voter_id: fav.user.id,
        voter_type: 'User',
        votable_id: fav.card.id,
        votable_type: 'Card',
        vote_flag: true
      )
    rescue => e
      raise "Unable to create vote after favorite: #{e}"
    end
  end
end
