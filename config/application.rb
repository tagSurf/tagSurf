require File.expand_path('../boot', __FILE__)

require 'rails/all'

Bundler.require(:default, Rails.env)

CONFIG = {}

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

    config.action_mailer.default_url_options = { host: 'localhost:3000' }
    config.action_mailer.delivery_method = :smtp
    config.action_mailer.smtp_settings = {
      :address              => "smtp.gmail.com",
      :port                 => 587,
      :domain               => "tagsurf.co",
      :user_name            => "beta@tagsurf.co",
      :password             => ENV["TS_MAIL_SECRET"],
      :authentication       => 'plain',
      :enable_starttls_auto => true
    }

    config.action_mailer.perform_deliveries = true
    config.action_mailer.raise_delivery_errors = false

    redis_active = Rails.env.development? ? false : true
    CONFIG[:redis_active] = redis_active  
    CONFIG[:blacklisted_tags] = ["boobies", "wouldtotallyfuck", "porn"]

  end
end
