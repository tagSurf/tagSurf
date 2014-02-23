class SessionsController < Devise::SessionsController
  def destroy
    reset_session
    super
  end
end
