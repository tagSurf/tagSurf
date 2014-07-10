class Api::UsersController < Api::BaseController
    
  before_action :find_authenticated_user, except: :stats
  
  def paginated_history
    @offset = user_params["offset"].to_i
    @limit = user_params["limit"].to_i
    @voted = Vote.paginated_history(current_user.id, @limit, @offset) 
    if @voted
      render json: @voted, root: 'data'
    else
      render json: "Nothing here"
    end
  end

  def bracketed_history
    vote = Vote.where(votable_id: params[:id], voter_id: @user.id).first

    unless vote
      render json: {error: "no votes for media: #{params[:id]} and user" }, status: :not_found
      return
    end

    @media = Vote.bracketed_collection(vote)
    if @media.present?
      render json: @media, each_serializer: MediaSerializer, root: 'data'
    else
      render json: {error: 'no media found'}, status: :not_found
    end
  end

  def next_history
    vote = Vote.where(votable_id: params[:id], voter_id: @user.id).first

    unless vote
      render json: {error: "no votes for media: #{params[:id]} and user" }, status: :not_found
      return
    end

    @media = Vote.next_collection(vote)
    if @media.present?
      render json: @media, each_serializer: MediaSerializer, root: 'data'
    else
      render json: {error: 'no media found'}, status: :not_found
    end

  end

  def previous_history
    vote = Vote.where(votable_id: params[:id], voter_id: @user.id).first

    unless vote
      render json: {error: "no votes for media: #{params[:id]} and user" }, status: :not_found
      return
    end

    @media = Vote.previous_collection(vote)
    if @media.present?
      render json: @media, each_serializer: MediaSerializer, root: 'data'
    else
      render json: {error: 'no media found'}, status: :not_found
    end
  end

  def up
    @voted = @user.find_up_voted_items
    if @voted
      render json: @voted
    else
      render json: "no up voted items"
    end
  end

  def down
    @voted = @user.find_down_voted_items
    if @voted
      render json: @voted
    else
      render json: "no down voted items"
    end
  end

  def stats
    if @user = current_user
      results = {:user => @user}
      results['total_votes'] = @user.find_voted_items.count
      results['up_votes']    = @user.find_up_voted_items.count
      results['down_votes']  = @user.find_down_voted_items.count
      render json: results
    else
      render json: "no active user"
    end
  end

  private

    def user_params
      params.permit(:user, :limit, :offset, :email, :confirm_feature_tour) 
    end
end
