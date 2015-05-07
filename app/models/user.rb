class User < ActiveRecord::Base

  # Stores a Redis list of ids 
  # representing the users voting history
  # Much faster and more practical than SQL
  include Redis::Objects
  set :voted_on

  has_friendship

  has_many    :votes, :foreign_key => :voter_id
  has_many    :favorites
  has_many    :referrals, :foreign_key => :referrer_id
  belongs_to  :access_code

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable, 
         :registerable, :confirmable,
         :omniauthable, :omniauth_providers => [:imgur, :facebook]

  CLIENT_ID = Rails.env.production? ? 'e0d1a9753eaf289' : '63c3978f06dac10'
  CLIENT_SECRET = Rails.env.production? ? '804e630c072f527b68bdfcc6a08ccbfe2492ab99' : '4eea9bc017f984049cfcd748fb3d8de17ae1cb8e'

  before_create     :assign_beta_code
  before_validation :generate_slug

  validates_presence_of :slug

  validates_uniqueness_of :username, :allow_blank => true, :message => "username taken"

  scope :sorted_history, order("created_at ASC")

  after_commit :destroy_all_relations, on: :destroy

  def welcomed?
    completed_feature_tour?
  end

  def expired_imgur_token?
    Time.now > imgur_token_expires_at
  end 

  def find_voted_items
    Vote.where(voter_id: id)
  end

  def find_up_voted_items
    Vote.where(voter_id: id, vote_flag: true)
  end

  def find_down_voted_items
    Vote.where(voter_id: id, vote_flag: false)
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

  def self.from_omniauth(auth)
    user = User.where(email: auth.info.email).first
    unless user
      user = User.where(provider: auth.provider, uid: auth.uid).first_or_create! do |user|
        user.uid = auth.uid
        user.provider = auth.provider
        user.email = auth.info.email
        user.first_name = auth.info.first_name
        user.last_name = auth.info.last_name
        user.profile_pic_link = (auth.provider == "facebook") ? "http://graph.facebook.com/" + auth.uid + "/picture?type=square" : auth.info.image
        user.password = Devise.friendly_token[0,20]
        user.facebook_auth_token = auth.credentials.token
        user.facebook_token_expires_at = auth.credentials.expires_at
        user.facebook_token_created_at = Time.now
        user.gender = auth.extra.raw_info.gender
        user.location = auth.extra.raw_info.locale
        user.active = true
        user.beta_user = true
      end
    end
    if user.provider != auth.provider
      user.uid = auth.uid
      user.provider = auth.provider
      user.facebook_auth_token = auth.credentials.token
      user.facebook_token_expires_at = auth.credentials.expires_at
      user.facebook_token_created_at = Time.now
      user.gender = auth.extra.raw_info.gender
      user.location = auth.extra.raw_info.locale

      user.save
    end
    if user.profile_pic_link.nil?
      user.profile_pic_link = (auth.provider == "facebook") ? "http://graph.facebook.com/" + auth.uid + "/picture?type=square" : auth.info.image
      
      user.save
    end
    if user.first_name.nil? || auth.info.first_name != user.first_name
      user.first_name = auth.info.first_name
      user.last_name = auth.info.last_name

      user.save
    end
    user
  end

  def self.from_native(fb_params)
    user = User.where(email: fb_params[:email]).first
    unless user
      user = User.where(provider: 'facebook', uid: fb_params[:uid]).first_or_create! do |user|
        user.uid = fb_params[:uid]
        user.provider = 'facebook'
        user.email = fb_params[:email]
        user.first_name = fb_params[:first_name]
        user.last_name = fb_params[:last_name]
        user.profile_pic_link = fb_params[:profile_pic_link].nil? ? "http://graph.facebook.com/" + fb_params[:uid] + "/picture?type=square" : fb_params[:profile_pic_link]
        user.password = Devise.friendly_token[0,20]
        user.facebook_auth_token = fb_params[:facebook_auth_token]
        user.facebook_token_expires_at = fb_params[:facebook_token_expires_at]
        user.facebook_token_created_at = Time.now
        user.gender = fb_params[:gender]
        user.location = fb_params[:location]
        user.active = true
        user.beta_user = true
      end
    end
    if user.provider != 'facebook'
      user.uid = fb_params[:uid]
      user.provider = 'facebook'
      user.facebook_auth_token = fb_params[:facebook_auth_token]
      user.facebook_token_expires_at = fb_params[:facebook_token_expires_at]
      user.facebook_token_created_at = Time.now
      user.gender = fb_params[:gender]
      user.location = fb_params[:location]

      user.save
    end
    if user.profile_pic_link.nil?
      user.profile_pic_link = "http://graph.facebook.com/" + fb_params[:uid] + "/picture?type=square"
      
      user.save
    end
    if user.first_name.nil? || fb_params[:first_name] != user.first_name
      user.first_name = fb_params[:first_name]
      user.last_name = fb_params[:last_name]

      user.save
    end

    user
  end 

  def self.link_fb(user, fb_params)
    user = User.find(user)
    user.uid = fb_params[:uid]
    user.provider = 'facebook'
    user.profile_pic_link = fb_params[:profile_pic_link].nil? ? "http://graph.facebook.com/" + fb_params[:uid] + "/picture?type=square" : fb_params[:profile_pic_link]
    user.facebook_auth_token = fb_params[:facebook_auth_token]
    user.facebook_token_expires_at = fb_params[:facebook_token_expires_at]
    user.facebook_token_created_at = Time.now
    user.gender = fb_params[:gender]
    user.location = fb_params[:location]
    if user.first_name.nil? || fb_params[:first_name] != user.first_name
      user.first_name = fb_params[:first_name]
      user.last_name = fb_params[:last_name]
    end

    user.save
  end

  def self.buddy_list(user_id)

    friends = User.find(user_id).friends.map{|u| [u.id, u.email, u.username, u.first_name, u.last_name, u.profile_pic_link]}

    recent_shares = Array.new
    buddy_ids = Array.new

    recent_shares = Referral.unscoped.where(referrer_id: user_id).select(:user_id).map{|r| r.user_id}

    buddy_ids = recent_shares.inject(Hash.new(1)) { |h, e| h[e] += 1 ; h }.to_a.sort_by(&:last).reverse.map {|x,y| x}

    buddies = User.find(buddy_ids).index_by(&:id).values_at(*buddy_ids).map{|u| [u.id,u.email,u.username, u.first_name, u.last_name, u.profile_pic_link]}
    
    buddies.concat(friends)
        
    buddies.uniq!

    buddies

  end

  def self.match_users(contacts, user)
    phones = Hash.new()
    emails = Hash.new()
    pending_friends = User.find(user).pending_friends.map{|u| u.id}
    friends = User.find(user).friends.map{|u| u.id}
    friends.concat(pending_friends)

    User.select(:phone, :username, :id, :profile_pic_link).where(:phone_confirmed => true).each {|u| phones[u.phone] = [u.id, u.username, u.profile_pic_link]}

    User.all.select(:email, :username, :id, :profile_pic_link).each {|u| emails[u.email] = [u.id, u.username, u.profile_pic_link]}
    
    contacts.each do |c|
      if c[:phone_number].empty? && c[:emails].empty?
        contacts.delete(c)
      elsif c[:first_name].empty? && c[:last_name].empty?
        contacts.delete(c)
      end
    end

    # No idea why we have to do this twice o.O
    # First pass misses a few...
    contacts.each do |c|
      if c[:phone_number].empty? && c[:emails].empty?
        contacts.delete(c)
      end
    end

    #ToDo Refactor this and make it more efficient
    contacts.each do |c|
      if !c[:phone_number].empty? && contacts.select{|e| e[:phone_number] == c[:phone_number]}.count > 1
        dups = contacts.select{|e| e[:phone_number] == c[:phone_number]}
        consolidate = Hash.new()
        consolidate[:emails] = Array.new
        dups.each do |d|
          consolidate[:first_name] ||= d[:first_name]
          consolidate[:last_name] ||= d[:last_name]
          consolidate[:phone_number] ||= d[:phone_number]
          if !d[:emails].empty? && d[:emails].is_a?(Array) 
            consolidate[:emails].concat(d[:emails])
            consolidate[:emails].uniq!
          elsif !d[:emails].empty?
            consolidate[:emails].push(d[:emails])
            consolidate[:emails].uniq!
          end
          contacts.delete(d)
        end
        if consolidate[:emails].empty?
          consolidate[:emails] = ""
        end
        contacts.push(consolidate)
      end
      if contacts.select{|e| e[:first_name] == c[:first_name] && e[:last_name] == c[:last_name]}.count > 1
        dups = contacts.select{|e| e[:first_name] == c[:first_name] && e[:last_name] == c[:last_name]}
        consolidate = Hash.new()
        consolidate[:emails] = Array.new
        dups.each do |d|
          consolidate[:first_name] ||= d[:first_name]
          consolidate[:last_name] ||= d[:last_name]
          consolidate[:phone_number] ||= d[:phone_number]
          if !d[:emails].empty? && d[:emails].is_a?(Array) 
            consolidate[:emails].concat(d[:emails])
            consolidate[:emails].uniq!
          elsif !d[:emails].empty?
            consolidate[:emails].push(d[:emails])
            consolidate[:emails].uniq!
          end
          contacts.delete(d)
        end
        if consolidate[:emails].empty?
          consolidate[:emails] = ""
        end
        contacts.push(consolidate)
      end
    end

    contacts.sort_by!{|c| c[:first_name].downcase + c[:last_name].downcase}

    contacts.each do |c|
      if c[:phone_number] && phones[c[:phone_number]]
        c[:user_id] = phones[c[:phone_number]][0]
        c[:username] = phones[c[:phone_number]][1]
        c[:profile_pic] = phones[c[:phone_number]][2]
        c[:requested] = friends.include?(c[:user_id])
        # puts "user found by phone! " + c[:first_name] + " " + c[:last_name]
      elsif !c[:emails].empty?
        c[:emails].each do |e|
          if emails[e]
            c[:user_id] = emails[e][0]
            c[:username] = emails[e][1]
            c[:profile_pic] = emails[e][2]
            c[:requested] = friends.include?(c[:user_id])
            # puts "user found by email! " + c[:first_name] + " " + c[:last_name]
          end
        end
      end
    end

    contacts.uniq!

    contacts
  
  end

  def self.full_list
    list = User.where('username IS NOT NULL').map{|u| [u.id, u.email, u.username, u.first_name, u.last_name, u.profile_pic_link]}
  end 

  protected

  def generate_slug
    self.slug = SecureRandom.uuid
  end

  def assign_beta_code
    # For those who need not a code
  end

  def confirmation_required?
    false
  end

  def destroy_all_relations
    self.votes.each do |v|
      v.destroy!
    end

    Referral.unscoped.where(:referrer_id => id).each do |r|
      r.destroy!
    end

    Referral.unscoped.where(:user_id => id).each do |r|
      r.destroy!
    end

    Bump.where(:sharer_id => id).each do |b|
      b.destroy!
    end

    Bump.where(:bumper_id => id).each do |b|
      b.destroy!
    end

  end
  
end
