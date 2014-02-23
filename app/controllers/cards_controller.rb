class CardsController < ApplicationController

  before_action :authenticate_user!
  before_action :find_authenticated_user

  layout 'internal'

  def add_vote
    @card = Card.find card_params[:id]
    @result = @card.vote :voter => @user, :vote => card_params[:vote]
    render json: @result 
  end

  def vote
    @card = Card.new
    @tags = Tag.all
    if @card.cache_update_available?
      @card.refresh!
    end
  end

  def show
    @card = Card.next_tagged(@user, card_params[:tag])
    if @card
      @card
    else
      render 404
    end
  end

  def next
    @cards = Card.next(@user)
    render json: @cards.to_a[2..9]
  end

  private

    def card_params
      params.permit(:id, :vote, :tag)
    end

    def find_authenticated_user
      @user = current_user
    end

end
