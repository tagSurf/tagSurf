unless Tag.where(name: 'imgurhot')
  Tag.create(name: 'imgurhot')
end

Card.populate_trending!

unless User.where(email: 'admin@example')
  User.create(email: 'admin@example.com', password: '12345678', password_confirmation: '12345678', beta_user: true)
end

unless AccessCode.where(code: 'test')
  AccessCode.create(name: 'test', code: test, expires: false)
end

