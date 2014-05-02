class ConfirmationController < Devise::ConfirmationsController
    
  def create
    self.resource = resource_class.send_confirmation_instructions(resource_params)
    yield resource if block_given?

    if successfully_sent?(resource)
      respond_with({}, location: root_path)
    else
      respond_with(resource)
    end
  end


end
