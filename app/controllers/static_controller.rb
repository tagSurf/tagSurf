class StaticController < ApplicationController

  # Keep the default controller action
  # This will make it easy to have a beta page
  # for desktop and tablets
  def index
    if current_user
      redirect_to '/t/hot'
    else
      redirect_to user_session_path
    end
  end

  def device
    if current_user && current_user.admin? 
      redirect_to sidekiq_web_path
    end
  end

end
