class PasswordsController < Devise::PasswordsController


  # PUT /resource/password
  def update
    self.resource = resource_class.reset_password_by_token(resource_params)
    yield resource if block_given?
    
    if resource.errors.empty?
      resource.unlock_access! if unlockable?(resource)
      flash = nil
      sign_in(resource_name, resource)
      respond_with resource, location: after_resetting_password_path_for(resource)
    else
      flash[:error] = resource.errors.full_messages
      respond_with resource
    end
  end

end
