class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  before_filter :get_tags, :redirect_desktops

  def get_tags
    @tags = Tag.all
  end

  def redirect_desktops
    return unless Rails.env.production? && !browser.mobile? 
    if current_user && current_user.admin? 
      redirect_to sidekiq_web_path
    else
      redirect_to device_path
    end
  end 

end
