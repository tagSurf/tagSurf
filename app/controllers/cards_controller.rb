class CardsController < ApplicationController

  before_action :authenticate_user!
  before_action :find_authenticated_user
  #before_action :update_cache

  layout 'internal'

  def add_vote
    @card = Card.find card_params[:id]
    @result = @card.vote :voter => @user, :vote => card_params[:vote]
    render json: @result 
  end

  def vote
    # will need to cache this after a few thousand tags it will be terribly slow.
    @tags = Tag.all
  end

  def show
    @cards = Card.next(@user, card_params[:tag])
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
      params.permit(:id, :vote, :tag)
    end

    def find_authenticated_user
      @user = current_user
    end

    def update_cache
      @card = Card.new
      if @card.cache_update_available?
        @card.refresh!
      end
    end

end
