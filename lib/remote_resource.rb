require 'httparty'
require 'openssl'
require 'base64'

class RemoteResource
  include HTTParty

  def self.get_request(service, provider)
    if provider = 'imgur'
      HTTParty.get(
        "https://imgur-apiv3.p.mashape.com/3/#{service}",
        :headers => {
          "Authorization" => "Client-ID #{ENV['TS_IMGUR']}",
          "X-Mashape-Authorization" => ENV['TS_MASHAPE']
        }
      )
    elsif provider = 'instagram'
      digest = OpenSSL::Digest::Digest.new('sha256')
      signature = OpenSSL::HMAC.hexdigest(digest, ENV['TS_INSTAGRAM'], ENV['SERVER_IP'])
      HTTParty.get(
        "https://api.instagram.com/v1/tags/#{service}/media/recent?access_token=#{ACCESS-TOKEN}",
        :headers => {
          "X-Insta-Forwarded-For" => "#{ENV[SERVER_IP]}|#{ENV['TS_INSTAGRAM']}"
        }
      )
    end
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
