class Api::VotesController < Api::BaseController

  before_filter :find_authenticated_user 

  def show
    @voted = @user.find_voted_items
    if @votes
      render json: @votes
    else
      render json: "no voted items"
    end
  end

  private

    def vote_params
      params.permit(:user) 
    end

end
