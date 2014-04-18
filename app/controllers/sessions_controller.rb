class SessionsController < Devise::SessionsController
  
  layout 'client'
  
  def destroy
    reset_session
    super
  end
end
