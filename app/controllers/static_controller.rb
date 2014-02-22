class StaticController < ApplicationController

  # Keep the default controller action
  # This will make it easy to have a beta page
  # for desktop and tablets
  def index
    if current_user
      redirect_to voting_path
    else
      redirect_to user_session_path
    end
  end

end
