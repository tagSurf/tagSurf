class Api::MediaController < ApplicationController

  before_action :authenticate_user!
  before_action :find_authenticated_user

  def add_vote
    @card = Card.find card_params[:id]
    @vote = card_params[:vote] == 'like' ? true : false
    @result = Vote.create(:voter_id => @user.id, :votable_id => @card.id, :vote_flag => @vote)
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
      render json: {errors: 'no cards found'}, status: :not_found
    end
  end

  private

    def card_params
      params.permit(:id, :vote, :tag)
    end

    def find_authenticated_user
      @user = current_user
    end

end
