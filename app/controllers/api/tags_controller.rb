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
  
    if tag_params[:media_id].blank? || tag_params[:name].blank?
      render json: "Both media identifier and tag name required", status: :bad_request
      return
    end

    begin


      # Todo check blacklist
      # Todo check is user able to add tag
      # Check if tag exists
      if Tag.where('name ilike ?', tag_params[:name]).first
        @tag = tag_params[:name]
      else
        @tag = Tag.create!(name: tag_params[:name], created_by: @user.id, fetch_more_content: true).name
      end
    
      # Set tagging on media
      @media = Card.find tag_params[:media_id]
      @media.tag_list.add tag_params[:name] 
      @media.save! 

      if tag_params[:vote].present?
        vote = Vote.create!(
          vote_tag:   @tag, 
          voter_id:   @user.id,  
          votable_id: tag_params[:media_id],  
          votable_type: 'Card',
          vote_flag: (tag_params[:vote] == 'up')
        )
      end

      # respond if tagged and voted
      if vote.try(:id)
        res = {tag: tag_params[:name], message: "#{vote.vote_tag} and vote added to media", vote: "#{vote.vote_flag}"}
        render json: res, status: :ok
        return
      elsif @media.id
        res = {tag: tag_params[:name], message: "#{tag_params[:name]} added to media"}
        render json: res, status: :ok
        return
      else
        raise 'tag not created'
      end

    rescue => e
      render json: "Error: #{e}", status: :unprossible_entity
    end
  end

  private

    def tag_params
      params.permit(:name, :media_id, :vote) 
    end

end
