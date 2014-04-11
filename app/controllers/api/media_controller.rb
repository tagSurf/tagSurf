class Api::MediaController < Api::BaseController

  before_action :authenticate_user!
  before_action :find_authenticated_user

  def create_vote
    @media = Card.find media_params[:id]
    @vote = media_params[:vote] == 'up' ? true : false
    begin
      result = Vote.create(voter_type: 'User', voter_id: @user.id, votable_id: @media.id, vote_flag: @vote, votable_type: 'Card')
      render json: {success: "true"}
    rescue => e
      render json: {error: "something went wrong"}, status: :unprocessible_entity
    end
  end

  def votes
    @tag = Tag.all
  end

  def show
    @cards = Card.find media_params[:media_id]
    if @card
      @card
    else
      render json: {errors: "no card found"}, status: :not_found
    end
  end

  def next
    @cards = Card.next(@user, media_params[:tag])
    if @cards.present?
      render json: @cards, root: "data"
    else
      render json: {errors: 'no cards found'}, status: :not_found
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
