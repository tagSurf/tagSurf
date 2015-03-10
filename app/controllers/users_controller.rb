class UsersController < ApplicationController

  layout 'client'

  def update
    current_user.update(update_user_params)

    if current_user.welcomed? 
      redirect_to feed_path
    else
      redirect_to root_path
    end
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

  def history
  end
 
  private
  
  def update_user_params
    params.require(:user).permit(:confirm_feature_tour, :username) 
  end


end
