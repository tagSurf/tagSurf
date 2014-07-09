require 'httparty'

class RemoteResource
  include HTTParty

  def self.get_request(service)
    requested_service = "https://imgur-apiv3.p.mashape.com/3/#{service}"
    url = URI.parse(URI.encode(requested_service.strip))
    HTTParty.get(
      url,
      :headers => {
        "Authorization" => "Client-ID #{ENV['TS_IMGUR']}",
        "X-Mashape-Authorization" => ENV['TS_MASHAPE']
      }
    )
  end

  def self.viral_feed
    service = 'gallery/hot/viral/0'
    RemoteResource.get_request(service)
  end

  def self.tagged_feed(tag)
    service = "gallery/r/#{tag}/" 
    RemoteResource.get_request(service)
  end

  def self.imgur_media(remote_id)
    service = "image/#{remote_id}/" 
    RemoteResource.get_request(service)
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
