class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  def redirect_desktops
    unless browser.mobile?
      unless  current_user && current_user.admin? 
        redirect_to '/desktop'
      end
    end
  end 

end
