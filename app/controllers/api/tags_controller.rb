class Api::TagsController < Api::BaseController

  def index
    tags = Tag.pluck(:name)
    tags << "trending"
    render json: tags
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
    requested_tag = tag_params[:name]

    unless tag = Tag.where('name ilike ?', requested_tag).first
      Tag.create(name: tag, user_id: @user.id)
    end

    if tag_and_vote = tag_params[:vote]
      vote = Vote.create(
        vote_tag:   tag_params[:name], 
        voter_id:   @user.id,  
        votable_id: card_id,  
        vote_tag: tag_and_vote
      )
    else
      vote = Vote.create(
        vote_tag:   tag_params[:name], 
        voter_id:   @user.id,  
        votable_id: card_id  
      )
    end
    
    render json: "you didn't create a tag yet"
  end

  private

    def tag_params
      params.permit(:name, :card_id, :vote) 
    end

end
