class ClientController < ApplicationController

  before_action :authenticate_user!, except: [
    :index, 
    :access_code,
    :confirm_beta_token, 
    :disclaimer,
    :terms,
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
    :tag,
    :desktop 
  ] 

  before_action :redirect_desktops, only: [
    :feed,
    :favorites,
    :trending, 
    :submissions,
    :tag 
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

  # Beta access post requests
  # Multi-setp form throug POST requests

  # Step one
  def confirm_beta_token
    code = AccessCode.where(code: beta_code_params[:access_code]).first
    if code && code.valid_code?
      redirect_to "/disclaimer?code=#{code.code}"
    else
      flash[:error] = ["Invalid beta code."]
      redirect_to :root
    end
  end

  # Step two
  def disclaimer_agreement
    code = AccessCode.where(code: beta_code_params[:access_code]).first.code
    if beta_code_params[:d_accept] == 'true' and code
      redirect_to "/terms?code=#{code}&d_accept=true"
    else
      redirect_to root_path, status: :not_authorized
    end
  end

  # Step three
  def terms_agreement
    code = AccessCode.where(code: beta_code_params[:access_code]).first.code
    terms = beta_code_params[:t_accept] 
    email = beta_code_params[:email]

    unless email.present?
      flash[:error] = ["Enter an email to continue."] 
      redirect_to "/terms?code=#{code}&d_accept=true"
      return
    end

    if User.where(email: email).exists?
      flash[:error] = ["Email address already registered."]
      redirect_to "/terms?code=#{code}&d_accept=true"
      return
    end
    
    if terms == 'true' and code.present? and email.present?
      redirect_to "/sign-up?code=#{code}&d_accept=true&t_accept=true&email=#{email}"
    else
      redirect_to "/terms?code=#{code}&d_accept=true", error: 'Please enter your email.'
    end
  end

  ### End beta access 

  # Static application
  def trending; end
  def feed;
    flash.discard(:notice)
  end
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

  def resend_link; 
    if current_user and current_user.welcomed?
      redirect_to root_path
    end
  end

  def welcome; end
  def device; end

  private

    def beta_code_params
      params.require(:access_code).permit(:access_code, :d_accept, :t_accept, :email, :password, :password_confirmation)
    end

    def confirm_surfable
      unless current_user and current_user.confirmed? and current_user.welcomed?
        redirect_to root_path
      end
    end

end
