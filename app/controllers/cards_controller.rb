class CardsController < ApplicationController

  before_action :find_authenticated_user

  def add_vote
    @card = Card.find card_params[:id]
    result = @card.vote :voter => @user, :vote => card_params[:vote]
    if result
      redirect_to :root, notice: "Vote recorded"
    else
      redirect_to :root, flash: "Something went wrong, please vote again" 
    end
  end

  def vote
    @card = Card.next(@user)
    if @card.cache_update_available?
      @card.refresh!
    end
  end

  private

    def card_params
      params.permit(:id, :vote)
    end
  
    def find_authenticated_user
      @user = current_user
    end

end
