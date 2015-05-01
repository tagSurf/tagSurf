class Api::BaseController < ApplicationController
  before_filter :find_authenticated_user
  skip_before_filter :verify_authenticity_token  

  private

    def find_authenticated_user
      unless @user = current_user
        render json: {errors: "authentication required"}, status: :unauthorized
      end
    end
end
