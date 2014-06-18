class Api::TagsController < Api::BaseController

  def tag_feed
    tags = Tag.current_feed(false)
    render json: tags
  end

  def search
    if tag_params[:query]
      tags = Tag.autocomplete(false)
      render json: tags
    else
      render json: "Must submit a search query. Example: http://domain.com/api/tags/search?query=example", status: :not_found
    end
  end

  def show
    @media = Media.tagged_with(tag_params['name']).order('created_at DESC')
    if @media
      render json: @media
    else
      render json: "no media with that tag"
    end
  end

  # Creates new tag on media and upvote for that item
  def create
  
    if tag_params[:media_id].blank? || tag_params[:name].blank?
      render json: "Both media identifier and tag name required", status: :bad_request
      return
    end

    begin
      # Todo check blacklist

      # Check if tag exists
      if tag = Tag.where('name ilike ?', tag_params[:name]).first
        @tag = tag.name
      else
        @tag = Tag.create!(name: tag_params[:name], created_by: @user.id, fetch_more_content: true).name
      end

      # Check if user can add a specific tag
      # Right now we only filter on 'StaffPicks'
      if @tag == 'StaffPicks' and !@user.admin?
        render json: "Only Staff can add StaffPicks", status: :not_authorized 
        return
      end
    
      # Set tagging on media
      @media = Media.find tag_params[:media_id]
      @media.tag_list.add @tag
      @media.save! 

      if tag_params[:vote].present?
        vote = Vote.create!(
          voter_type: 'User',
          vote_tag:   @tag, 
          voter_id:   @user.id,  
          votable_id: tag_params[:media_id],  
          votable_type: 'Media',
          vote_flag: (tag_params[:vote] == 'up')
        )
      end

      # respond if tagged and voted
      if vote.try(:id)
        res = {tag: tag_params[:name], message: "#{vote.vote_tag} and vote added to media", vote: "#{vote.vote_flag}"}
        @user.voted_on << vote.id
        IncrementMediaVoteCount.perform_async(tag_params[:media_id], result.vote_flag)

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
      params.permit(:name, :media_id, :vote, :query) 
    end

end
