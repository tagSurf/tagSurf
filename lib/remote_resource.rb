require 'httparty'

class RemoteResource
  include HTTParty

  # TODO move to env variables
  TEST_CLIENT = '63c3978f06dac10'
  PROD_CLIENT = 'e0d1a9753eaf289'

  def self.get
    app = 'https://api.imgur.com/3/'
    service = 'gallery/hot/viral/0.json'
    if Rails.env.development?
      HTTParty.get(app + service, :headers => {"Authorization" => "Client-ID 63c3978f06dac10"})
    else
      HTTParty.get(app + service, :headers => {"Authorization" => "Client-ID e0d1a9753eaf289"})
    end
  end


  def self.get_tag(tag)
    app = 'https://api.imgur.com/3/'
    service = "gallery/r/#{tag}/" 
    if Rails.env.development?
      HTTParty.get(app + service, :headers => {"Authorization" => "Client-ID 63c3978f06dac10"})
    else
      HTTParty.get(app + service, :headers => {"Authorization" => "Client-ID e0d1a9753eaf289"})
    end
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
