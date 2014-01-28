class User < ActiveRecord::Base

  acts_as_voter

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable, 
         :omniauthable, :omniauth_providers => [:imgur]

  CLIENT_ID = Rails.env.production? ? 'e0d1a9753eaf289' : '63c3978f06dac10'
  CLIENT_SECRET = Rails.env.production? ? '804e630c072f527b68bdfcc6a08ccbfe2492ab99' : '4eea9bc017f984049cfcd748fb3d8de17ae1cb8e'


  validates :beta_user, inclusion: [true]

  def expired_imgur_token?
    Time.now > imgur_token_expires_at
  end 

  def refresh_imgur_token
    params = {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: imgur_refresh_token
    }

    response = HTTParty.post(
      "https://api.imgur.com/3/oauth2/token", 
      :body => params  
    )

    # if response success
    self.imgur_auth_token = response["token"]
    self.imgur_token_expires_at = Time.now + 3600
    self.save
  end

  def self.create_imgur_user(auth, code)
    @auth = auth.credentials
    auth_value = "Bearer " + @auth.token 

    response = HTTParty.get(
      "https://api.imgur.com/3/account/me", 
      :headers => { "Authorization" => auth_value }
    ) 

    @user = response.parsed_response["data"]

    user = User.where(:provider => 'imgur', :uid => "#{@user['id']}").first
    unless user
      user = User.create!({
        uid: @user["id"],
        username: @user["url"],
        email: "#{@user["url"]}-#{@user["id"]}@imgur.com",
        provider: 'imgur',
        password: Devise.friendly_token[0,20], 
        imgur_refresh_token: @auth.refresh_token,
        imgur_auth_token: @auth.token,
        imgur_pro_expiration: @user["pro_expiration"],
        imgur_token_expires_at: Time.now + 3600,
        imgur_token_created_at: Time.now,
        active: true
      })
    end
    user
  end

  def self.from_oauth(auth, code, signed_in_resource=nil)
    if auth.provider == 'imgur'
      user = create_imgur_user(auth, code)
    else
      raise "Only Imgur accounts allowed at this time"
    end
    user
  end
  
end
