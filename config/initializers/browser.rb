Rails.configuration.middleware.use Browser::Middleware do
  if Rails.env.production? && !browser.mobile?
    # Moved to ApplicationController 
    # redirect_to device_path
  end
end
