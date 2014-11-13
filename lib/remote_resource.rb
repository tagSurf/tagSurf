require 'httparty'

class RemoteResource
  include HTTParty

  def self.get_request(uri, provider, offset, domain)
    if provider == 'imgur'
      HTTParty.get(
        "https://imgur-apiv3.p.mashape.com/3/#{uri}",
        :headers => {
          "Authorization" => "Client-ID #{ENV['TS_IMGUR']}",
          "X-Mashape-Authorization" => ENV['TS_MASHAPE']
        }
      )
    elsif provider == 'urx'
      HTTParty.get(
        "https://beta.urx.io/domain:#{domain}+action:ReadAction+offset:#{offset}+#{uri}",
        :headers => {
          "X-API-Key" => ENV['TS_URX']
        }
      )
    end
  end

  def self.viral_feed
    uri = 'gallery/hot/viral/0'
    RemoteResource.get_request(uri, 'imgur', nil, nil)
  end

  def self.tagged_feed(tag, provider, offset, domain)
    if provider == 'imgur'
      uri = "gallery/r/#{tag}/" 
      RemoteResource.get_request(uri, provider, offset, domain)
    elsif provider == 'urx'
      RemoteResource.get_request(tag, provider, offset, domain)
    else
      raise "Error unknown provider: #{provider}"
    end
  end

  def self.imgur_media(remote_id)
    uri = "image/#{remote_id}/" 
    RemoteResource.get_request(uri)
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
