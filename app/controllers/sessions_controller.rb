class SessionsController < Devise::SessionsController
  skip_before_filter :verify_authenticity_token, :only => :create

  def destroy
    reset_session
    super
  end

  def create
    respond_to do |format|
      #format.html {
      #  resource = warden.authenticate( { :scope => resource_name, :recall => "sessions#new" } )
      #  user = resource || User.find_by_email( params[:user][:email] )
      #      
      #  if resource
      #    fetch_browser_language(resource)

      #    set_flash_message(:notice, :signed_in) if is_navigational_format?
      #    sign_in(resource_name, resource)
      #    respond_with resource, :location => after_sign_in_path_for(resource)
      #  else
      #    check_channel_login
      #    if user
      #      arthur_hash.update({ action: 'failed', note: "Failed login from #{request.remote_ip}" })
      #      ArthurHelper.notify(arthur_hash)
      #    end
      #  end
      #}
      format.json {
        response = warden.authenticate!( { :scope => resource_name, :recall => "sessions#json_failure" } )
        render :status => 200, :json => {
          :success => true,
          :token => response
        }
      }
    end
  end 
end
