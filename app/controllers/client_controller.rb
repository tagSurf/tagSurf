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
    :password_submission,
    :authentication
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
    unless !usr 
      # if !usr.welcomed?
      #   redirect_to welcome_path
      if !usr.username
        redirect_to selectusername_path
      # elsif !usr.fb_link_requested && !usr.profile_pic_link
      #   redirect_to linkfb_path
      # elsif !usr.first_name
      #   redirect_to name_path
      elsif !usr.phone
        redirect_to phone_path
      elsif !usr.phone_confirmed
        redirect_to confirm_path
      elsif !usr.push_requested && params[:id].to_i == 0
        redirect_to "/push##{current_user.id}"
      else
        redirect_to feed_path
      end
      return
    end
    redirect_to user_session_path
  end

  # !!! Deprecated !!!
  # Beta access post requests
  # Multi-setp form throug POST requests

  # Step one
  def confirm_beta_token
    code = AccessCode.where(code: beta_code_params[:access_code]).first
    if code && code.valid_code?
      redirect_to "/terms?code=#{code.code}&d_accept=true"
    else
      flash[:error] = ["Invalid beta code."]
      redirect_to :root
    end
  end

  # Step two
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
  def bumps; end
  def tag; end
  def device; end

  # Beta access flow
  def access_code; end
  def disclaimer; end
  def terms; end
  def signup; end
  def authentication; end

  def share
    if current_user and !current_user.username
      redirect_to selectusername_path
    elsif current_user and !current_user.fb_link_requested and !current_user.profile_pic_link
      redirect_to linkfb_path
    elsif current_user and !current_user.first_name
      redirect_to name_path
    elsif current_user and !current_user.push_requested and params[:id].to_i == 0
      redirect_to "/push##{current_user.id}"
    elsif current_user and params[:tag] == "trending" 
      redirect_to "/feed#funny~#{params["id"]}"
    elsif current_user 
      redirect_to "/feed##{params["tag"]}~#{params["id"]}"
    elsif params["id"] == "0"
      confirm_surfable
    end
    @media = Media.where(id: params[:id]).try(:first)
  end

  def push_enable
    user = User.find(current_user.id)
    user.update_column :push_requested, true
    redirect_to "/feed#funny~0"    
  end

  def push
  end

  def bump
    unless !current_user || current_user.id != Referral.unscoped.find(params[:ref_id]).user_id
      Bump.bump_referral(params[:ref_id])
    end 
    media_id = Referral.unscoped.find(params[:ref_id]).media_id
    redirect_to "/feed#funny~#{media_id}"
  end
  
  def resend_link 
    if current_user and current_user.confirmed? 
      redirect_to root_path
    end
  end

  def welcome
    if current_user.welcomed?
      redirect_to root_path
    end
  end

  def username_select 
    @user = current_user
  end 

  def linkfb
    user = User.find(current_user.id)
    user.update_column :fb_link_requested, true
  end

  def enter_name
    @user = current_user
  end

  def enter_phone
    @user = current_user
    unless @user.confirmation_code
      ConfirmationCode.create(:user_id => @user.id).save
    end
  end

  def confirm
    @user = current_user
    @code
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
      unless current_user
        redirect_to root_path
      end
    end

end
