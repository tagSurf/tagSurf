class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable, 
         :omniauthable, :omniauth_providers => [:imgur]

  def self.create_imgur_user(auth, code)

    params = {
      client_id: '63c3978f06dac10',
      client_secret: '4eea9bc017f984049cfcd748fb3d8de17ae1cb8e',
      grant_type: 'authorization_code',
      code: code
    }

    response = HTTParty.post("https://api.imgur.com/oauth2/token", :body => params) 
    
    raise response.inspect

    user = User.create!(
      email: auth.username,
      password: Devise.friendly_token[0,20]
    )

  end

  def self.from_oauth(auth, code, signed_in_resource=nil)
    user = User.where(:provider => auth.provider, :uid => auth.uid).first
    unless user
      if auth.provider == 'imgur'
        user = create_imgur_user(auth, code)
      else
        raise "Only Imgur account allowed at this time"
      end
    end
    user
  end


  
end
