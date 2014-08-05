class Api::FavoritesController < Api::BaseController

  before_filter :find_authenticated_user 

  def create
    @fav = Favorite.new(user_id: @user.id, media_id: fav_params[:card_id]) 
    if @fav.save
      render json: {created: true}, status: :ok
    else
      render json: {created: false, reason: @fav.errors.full_messages.first }, status: :not_implemented 
    end
  end

  def delete
    @fav = Favorite.where(user_id: @user.id, media_id: fav_params[:card_id]).first
    if @fav && @fav.destroy
      render json: {removed: true}, status: :ok
    else
      render json: {removed: false, reason: "Missing resource"}, status: :not_implemented 
    end
  end

  def paginated_history
    @offset = fav_params["offset"].to_i
    @limit = fav_params["limit"].to_i
    @user = current_user

    # limit responses to 50 cards
    if @limit > 50
      @limit = 50
    end

    @media = Favorite.paginated_history(@user.id, @limit, @offset, @user.safe_mode)
    if @media
      render json: @media, root: 'data'
    else
      render json: "Nothing here"
    end
  end

  def bracketed_history
    favorite = Favorite.where(media_id: params[:id], user_id: @user.id).first

    unless favorite
      render json: {error: "no favorites for card: #{params[:id]} and user" }, status: :not_found
      return
    end

    @media = Favorite.bracketed_collection(favorite)
    if @media.present?
      render json: @media, each_serializer: MediaSerializer, root: 'data'
    else
      render json: {error: 'no media found'}, status: :not_found
    end
  end

  def next_history
    favorite = Favorite.where(media_id: params[:id], user_id: @user.id).first

    unless favorite
      render json: {error: "no favorites for media: #{params[:id]} and user" }, status: :not_found
      return
    end

    @media = Favorite.next_collection(favorite)
    if @media.present?
      render json: @media, each_serializer: MediaSerializer, root: 'data'
    else
      render json: {error: 'no media found'}, status: :not_found
    end

  end

  def previous_history
    favorite = Favorite.where(media_id: params[:id], user_id: @user.id).first

    unless favorite
      render json: {error: "no favorites for media: #{params[:id]} and user" }, status: :not_found
      return
    end

    @media = Favorite.previous_collection(favorite)
    if @media.present?
      render json: @media, each_serializer: MediaSerializer, root: 'data'
    else
      render json: {error: 'no media found'}, status: :not_found
    end
  end

  private

    def fav_params
      params.permit(:card_id, :limit, :offset)
    end

end
