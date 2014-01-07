require 'omniauth-oauth2'

module OmniAuth
  module Strategies
    class Imgur < OmniAuth::Strategies::OAuth2
      
      option :client_options, {
        site:           "https://api.imgur.com",
        authorize_url:  "/oauth2/authorize",
        token_url:      "/oauth2/token",
        add_client:     "/oauth2/addclient"
      }

      uid { raw_info['id'] }

    end
  end
end
