class SessionsController < Devise::SessionsController

  def create
    super
  end

  def destroy
    reset_session
    super
  end
end
