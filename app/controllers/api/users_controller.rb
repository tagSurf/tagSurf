class Api::UsersController < Api::BaseController

  def history
    # Cheating pagination
    @voted = @user.find_voted_items[(user_params["offset"]).to_i .. (user_params["offset"].to_i + user_params["limit"].to_i)] 
    if @voted
      render json: @voted, root: 'data'
    else
      render json: "Nothing here"
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
