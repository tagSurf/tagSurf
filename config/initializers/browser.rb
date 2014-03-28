Rails.configuration.middleware.use Browser::Middleware do
  if Rails.env.production? && !browser.mobile?
    redirect_to '/device'
  end
end
