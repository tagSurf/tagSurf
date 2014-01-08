class OmniauthCallbacksController < Devise::OmniauthCallbacksController
  
  def all
    @user = User.from_oauth(request.env["omniauth.auth"], params[:code])
    if @user.persisted?
      sign_in_and_redirect @user, :event => :authentication 
      set_flash_message(:notice, :success, :kind => "Imgur") if is_navigational_format?
    else
      session["devise.imgur_data"] = request.env["omniauth.auth"]
      redirect_to new_user_registration_url
    end
  end

  alias_method :imgur, :all

end
