require File.expand_path('../boot', __FILE__)

require 'rails/all'

Bundler.require(:default, Rails.env)

module Tagsurf
  class Application < Rails::Application
    config.assets.enabled = false
    config.autoload_paths += Dir["#{config.root}/lib/**/**/"]
  end
end
