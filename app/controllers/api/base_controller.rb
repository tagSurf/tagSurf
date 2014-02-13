class Api::BaseController < ApplicationController
  before_filter :find_authenticated_user

  private

    def find_authenticated_user
      unless @user = current_user
        redirect_to :root
      end
    end
end
