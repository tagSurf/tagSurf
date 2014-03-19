jlass CardsController < ApplicationController

  before_action :authenticate_user!
  before_action :find_authenticated_user
  before_action :update_cache

  layout 'internal'

  def add_vote
    @card = Card.find card_params[:id]
    @result = @card.vote :voter => @user, :vote => card_params[:vote]
    render json: @result 
  end

  def vote
    @tag = Tag.all
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
    @cards = Card.next(@user, card_params[:tag])
    if @cards.present?
      render json: @cards
    else
      render json: {error: 'no cards found'}, status: :not_found
    end
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
