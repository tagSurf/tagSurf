class Api::TagsController < Api::BaseController

  def index
    render json: Tag.all
  end

  def show
    @cards = Card.tagged_with(tag_params['name']).order('created_at DESC')
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

    def tag_params
      params.permit(:name) 
    end

end
