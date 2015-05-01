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
      elsif !usr.fb_link_requested && !usr.profile_pic_link
        redirect_to linkfb_path
      elsif !usr.first_name
        redirect_to name_path
      elsif !usr.push_requested && params[:id].to_i == 0
        redirect_to "/push##{current_user.id}"
      else
        redirect_to feed_path
      end
      return
    end
    redirect_to user_session_path
  end

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
