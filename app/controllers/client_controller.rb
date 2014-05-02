class ClientController < ApplicationController

  before_action :authenticate_user!, except: :index

  layout 'client'

  def index
    # Decide how to direct the user base on state
    usr = current_user
    if usr and usr.confirmed? and usr.welcomed?
      redirect_to feed_path
    elsif usr and !usr.confirmed?
      redirect_to resend_path
    elsif usr and usr.confirmed? and !usr.welcomed? 
      redirect_to welcome_path
    else
      redirect_to user_session_path
    end
  end

  def trending; end
  def feed; end
  def favorites; end
  def history; end
  def submissions; end
  def tag; end
  def desktop; end

  # Beta access flow
  def access_code; end
  def disclaimer; end
  def terms; end
  def signup; end
  def resend_link; end
  def welcome; end

end
