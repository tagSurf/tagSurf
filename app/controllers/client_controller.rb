class ClientController < ApplicationController

  before_action :authenticate_user!, except: [
    :index, 
    :access_code,
    :confirm_beta_token, 
    :disclaimer,
    :terms,
    :share,
    :signup,
    :disclaimer_agreement,
    :terms_agreement,
    :password_submission
  ]

  before_action :confirm_surfable, only: [
    :feed, 
    :favorites, 
    :trending, 
    :history, 
    :submissions, 
    :tag
  ] 

  layout 'client'

  def index
    # Decide how to direct the user base on state
    usr = current_user
    if usr and usr.welcomed?
      redirect_to feed_path
    elsif usr and !usr.welcomed? 
      redirect_to welcome_path
    else 
      redirect_to user_session_path
    end
  end 

  # Static application
  def trending; end
  def feed;
    flash.discard(:notice)
  end
  def favorites; end
  def history; end
  def submissions; end
  def tag; end
  def device; end

  # Beta access flow
  def access_code; end
  def disclaimer; end
  def terms; end
  def signup; end

  def share
    @media = Media.find(params[:id])
  end


  def resend_link; 
    if current_user and current_user.confirmed? 
      redirect_to root_path
    end
  end

  def welcome
    if current_user.welcomed?
      redirect_to feed_path
    end
  end


  private

    def beta_code_params
      params.require(:access_code).permit(
        :access_code, 
        :d_accept, 
        :t_accept, 
        :email, 
        :password, 
        :password_confirmation
      )
    end

    def confirm_surfable
      unless current_user and current_user.welcomed?
        redirect_to root_path
      end
    end

end
