class Api::MediaController < Api::BaseController

  before_action :find_authenticated_user

  def create_vote

    unless @user
      render json: {error: "must be logged in to vote"}, status: :unauthorized
      return
    end 

    @vote = media_params[:vote] == 'up' ? true : false
    @user.voted_on << media_params[:id]
    vote = Vote.create(
      voter_type: 'User', 
      voter_id: @user.id, 
      votable_id: media_params[:id], 
      vote_flag: @vote, 
      votable_type: 'Media',
      vote_tag: media_params[:tag]
    )
    if vote
      IncrementMediaVoteCount.perform_async(media_params[:id], vote.vote_flag)
      render json: {success: "true"}
    else
      render json: {error: "something went wrong: #{e}"}, status: :unprocessible_entity
    end
  end

  def share_feed
    @media = Media.next(@user, media_params[:tag], media_params[:id])
    if @media.present?
      render json: @media, root: "data"
    else
      render json: {errors: 'no media found'}, status: :not_found
    end
  end

  def next
    unless @user
      render json: {errors: 'must be logged in to view feed.'}, status: :unauthorized
      return
    end
      
    @media = Media.next(@user, media_params[:tag])
    if @media.present?
      render json: @media, root: "data"
    else
      render json: {errors: 'no media found'}, status: :not_found
    end
  end

  private

    def media_params
      params.permit(:id, :vote, :tag)
    end

    def find_authenticated_user
      @user = current_user
    end

end
