class ClientController < ApplicationController

  before_action :authenticate_user!, except: [
    :index, 
    :access_code,
    :confirm_beta_token, 
    :disclaimer,
    :terms,
    :signup
  ]

  before_action :confirm_surfable, only: [
    :feed, 
    :favorites, 
    :trending, 
    :history, 
    :submissions, 
    :tag,
    :desktop 
  ] 

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

  def confirm_beta_token
    code = AccessCode.where(code: beta_code_params[:access_code]).first
    if code && code.valid?
      redirect_to disclaimer_path
    else
      redirect_to root_path
    end
  end

  # Static application
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

  private

    def beta_code_params
      params.require(:access_code).permit(:access_code)
    end

    def confirm_surfable
      unless current_user and current_user.confirmed? and current_user.welcomed?
        redirect_to root_path
      end
    end

end
