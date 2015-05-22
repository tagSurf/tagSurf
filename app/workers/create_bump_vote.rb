class CreateBumpVote
  include Sidekiq::Worker

  def perform(bump_id)
    begin
      bump = Bump.find(bump_id)
      vote = Vote.where(
        votable_id: bump.media_id, 
        votable_type: 'Media', 
        voter_id: bump.bumper_id, 
        voter_type: 'User'
      ).first
      unless vote
        vote = Vote.create!(
          voter_id: bump.bumper_id,
          voter_type: 'User',
          votable_id: bump.media_id,
          votable_type: 'Media',
          vote_flag: true
        )
      end
    rescue => e
      raise "Unable to create vote after bump: #{e}"
    end
  end
end