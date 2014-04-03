class UsersController < ApplicationController

  def new
    @user = User.new
  end
  
  api :POST, '/users'
  param :user, Hash, :desc => "User info" do
    param :email, String, :desc => "Username for login", :required => true
    param :password, String, :desc => "Password for login", :required => true
    param :password_confirmation, String, :desc => "Password for login", :required => true
    param :admin_override, String, :desc => "Not shown in documentation", :show => false
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
