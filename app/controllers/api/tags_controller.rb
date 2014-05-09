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
  
    if tag_params[:card_id].blank? || tag_params[:name].blank?
      render json: "Both media identifier and tag name required", status: :bad_request
      return
    end

    begin

      # Todo check blacklist
      # Todo check is user able to add tag
      # Check if tag exists
      if tag = Tag.where('name ilike ?', tag_params[:name]).first
        tag 
      else
        tag = Tag.create(name: tag, user_id: @user.id, fetch_more_content: true)
      end

      if tag_and_vote = tag_params[:vote]
        vote = Vote.create(
          vote_tag:   tag, 
          voter_id:   @user.id,  
          votable_id: card_id,  
          vote_flag: tag_and_vote
        )
      else
        # created taggings ?
        vote = Vote.create(
          vote_tag:   tag, 
          voter_id:   @user.id,  
          votable_id: card_id  
        )
      end

      if vote.id
        render json: "#{vote.vote_tag} created", status: :ok
        return
      else
        raise 'tag not created'
      end
    rescue => e
      render json: "something went wrong: #{e}", status: :unprossible_entity
    end
  end

  private

    def tag_params
      params.permit(:name, :card_id, :vote) 
    end

end
