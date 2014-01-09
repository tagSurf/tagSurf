Tagsurf::Application.routes.draw do

  devise_for :users, :controllers => { :omniauth_callbacks => "omniauth_callbacks", :sessions => 'sessions' }

  root 'static#index' 

end
