class UsersController < ApplicationController

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

end
