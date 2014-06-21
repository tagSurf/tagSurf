class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  def redirect_desktops
    return if browser.mobile?
    return if browser.tablet?
    unless current_user && current_user.admin? 
      redirect_to '/desktop'
    end
  end 

end
