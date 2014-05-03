class AccessCode < ActiveRecord::Base

  has_many :users

  validates_presence_of :name, :code

  before_validation(on: :create) do
    if code.nil?
      generate_activation_code
    end
  end

  # Remove the possibility of confusing ints/chars
  # ie... B versus 8, 0 versus O
  def generate_activation_code(size = 6)
    charset = %w{ 2 3 4 6 7 9 A C D E F G H J K M N P Q R T V W X Y Z}
    self.code = (0...size).map{ charset.to_a[rand(charset.size)] }.join
  end

  def valid_code?
    return true if expires.nil?
  end

end
