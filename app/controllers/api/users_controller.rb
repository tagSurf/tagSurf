class Api::UsersController < Api::BaseController

  def history
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
    @cards = Vote.bracketed_collection(vote)
    if @cards.present?
      render json: @cards, each_serializer: CardSerializer
    else
      render json: {error: 'no cards found'}, status: :not_found
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
    results = {:user => @user}
    results['total_votes'] = @user.find_voted_items.count
    results['up_votes']    = @user.find_up_voted_items.count
    results['down_votes']  = @user.find_down_voted_items.count
    if @user
      render json: results
    else
      render json: "no user found"
    end
  end

  private

    def user_params
      params.permit(:user, :limit, :offset) 
    end

end
