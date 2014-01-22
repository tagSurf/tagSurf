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
    @card = Card.next(@user).first
    if @card && @card.cache_update_available?
      @card.refresh!
    end
  end

  def show
    @card = Card.find card_params[:id]
    if @card
      @card
    else
      render 404
    end
  end

  def next
    @cards = Card.next(@user)
    render json: @cards
  end

  private

    def card_params
      params.permit(:id, :vote)
    end

    def find_authenticated_user
      @user = current_user
    end

end
