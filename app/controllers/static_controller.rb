class StaticController < ApplicationController

  def index
    if current_user
      redirect_to voting_path
    else
    end
  end

end
