Rails.configuration.middleware.use Browser::Middleware do
  redirect_to '/device' unless browser.mobile?
end
