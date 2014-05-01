class AccessCode < ActiveRecord::Base


  before_validation(on: :create) do
    generate_activation_code
  end

  # Remove the possibility of confusing ints/chars
  # ie... B versus 8, 0 versus O
  def generate_activation_code(size = 6)
    charset = %w{ 2 3 4 6 7 9 A C D E F G H J K M N P Q R T V W X Y Z}
    (0...size).map{ charset.to_a[rand(charset.size)] }.join
  end

end
