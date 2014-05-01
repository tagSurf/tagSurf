class ClientController < ApplicationController

  before_action :authenticate_user!, except: :index

  layout 'client'

  def index
    if current_user
      redirect_to '/feed'
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
  def code; end
  def disclaimer; end
  def terms; end
  def signup; end
  def resend; end
  def welcome; end

end
