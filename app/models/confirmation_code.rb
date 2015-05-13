class ConfirmationCode < ActiveRecord::Base
  has_one :user

  validates_presence_of :user_id, :code

  validates_uniqueness_of :user_id

  before_validation(on: :create) do
    if code.nil?
      generate_activation_code
    end
  end

  # Remove the possibility of confusing ints/chars
  # ie... B versus 8, 0 versus O
  def generate_activation_code(size = 4)
    charset = %w{ 1 2 3 4 5 6 7 8 9}
    self.code = (0...size).map{ charset.to_a[rand(charset.size)] }.join
  end

  def valid_code?
    return true if expires.nil?
  end

end
