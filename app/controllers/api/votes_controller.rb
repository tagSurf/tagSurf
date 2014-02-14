class Api::VotesController < Api::BaseController

  def index
    render json: Votes.all
  end

  def show
    @cards = Card.tagged_with(tag_params['name'])
    if @cards
      render json: @cards 
    else
      render json: "no cards with that tag"
    end
  end

  def create
    render json: "you didn't create a tag yet"
  end

  private

    def vote_params
      params.permit(:user) 
    end

end
