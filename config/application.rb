require File.expand_path('../boot', __FILE__)

require 'rails/all'

Bundler.require(:default, Rails.env)

module Tagsurf

  class Application < Rails::Application
    config.assets.enabled = false
    config.autoload_paths += Dir["#{config.root}/lib/**/**/"]

    config.to_prepare do
        Devise::SessionsController.layout "client"
        Devise::RegistrationsController.layout "client"
        Devise::ConfirmationsController.layout "client"
        Devise::UnlocksController.layout "client"            
        Devise::PasswordsController.layout "client"        
    end
  end
end
