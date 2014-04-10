class ClientController < ApplicationController

  layout 'client'

  def index
    if current_user
      redirect_to '/feed'
    else
      redirect_to user_session_path
    end
  end

  def feed
  end

  def favorites
  end

  def history
  end

  def submissions
  end

  def tag
  end

  def desktop
  end

end
