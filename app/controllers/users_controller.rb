class UsersController < ApplicationController
  include Devise::Controllers::Rememberable

  layout 'client'

  skip_before_filter :verify_authenticity_token, :only => [:from_native]

  def update
    if !params[:user][:username].nil?
      params[:user][:username].strip!
    end
    current_user.update(update_user_params)

    # if current_user.welcomed? 
    #   redirect_to feed_path
    # else
      redirect_to root_path
    # end
  end

  def new
    @user = User.new
  end
  
  def create
    @user = User.new(params[:user])
    if @user.save
      redirect_to '/t/hot', :notice => "Signed up!"
    else
      render "new"
    end
  end

  def from_native
    if current_user
      puts 'launched from_native'
      User.link_fb(current_user.id, fb_params)
      redirect_to feed_path, :notice => "facebook account linked!"
    else
      @user = User.from_native(fb_params)

      if @user.persisted?
        sign_in_and_redirect @user, :event => :authentication #this will throw if @user is not activated
        remember_me(@user)
      else
        session["devise.facebook_data"] = fb_params
        redirect_to new_user_registration_url
      end
    end
  end

  def history
  end
 
  private
  
  def update_user_params
    params.require(:user).permit(:completed_feature_tour, :username) 
  end

  def fb_params
    params.permit(
      :uid,
      :email,
      :first_name,
      :last_name,
      :facebook_auth_token,
      :profile_pic_link,
      :facebook_token_expires_at,
      :gender,
      :location
      )
  end

end
