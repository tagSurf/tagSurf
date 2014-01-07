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

      uid { 8571776 }
  
      info do
        {
          username: 'brettu' 
        }
      end

      extra do 
        {
          raw_info: raw_info
        }
      end

      def raw_info
        @raw_info ||= access_token.get("/users/auth/imgur/callback?code=#{access_token.token}").parsed
      end

    end
  end
end
