class Api::VotesController < Api::BaseController

  before_filter :find_authenticated_user 

  def show
    @voted = @user.find_voted_items
    if @voted
      render json: @voted
    else
      render json: "no voted items"
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

    def vote_params
      params.permit(:user) 
    end

end
