class Api::MediaController < Api::BaseController

  before_action :authenticate_user!
  before_action :find_authenticated_user

  def show
    @card = Media.find params[:id]
    render json: @card
  end

  def tags
    @tags = Tag.all
    render json: @tags, each_serializer: TagSerializer, root: 'data'
  end

  def create_vote
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
      IncrementMediaVoteCount.perform_async(media_params[:media_id], vote.vote_flag)
      render json: {success: "true"}
    else
      render json: {error: "something went wrong: #{e}"}, status: :unprocessible_entity
    end
  end

  def votes
    @tag = Tag.all
  end

  def next
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
