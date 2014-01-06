require 'httparty'

class RemoteResource
  include HTTParty

  # TODO move to env variables
  TEST_CLIENT = '63c3978f06dac10'
  PROD_CLIENT = 'e0d1a9753eaf289'

  def self.get(app=nil, service=nil)
    app = 'https://api.imgur.com/3/'
    service = 'gallery/hot/viral/0.json'
    HTTParty.get(app + service, :headers => {"Authorization" => "Client-ID 63c3978f06dac10"}) 
  end

  def self.content_type(type)
    if type == "image/jpeg"
      "jpg"
    elsif type == "image/gif"
      "gif"
    elsif type == "image/png"
      "png"
    else
      "jpg"
    end
  end

end
