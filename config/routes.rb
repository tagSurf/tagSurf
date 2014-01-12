Tagsurf::Application.routes.draw do

  devise_for :users, :controllers => { :omniauth_callbacks => "omniauth_callbacks", :sessions => 'sessions' }


  # Votes
  post   'votes/:resource/:id'             => 'votes#create'
  delete 'votes/:resource/:id'             => 'votes#destroy'

  # Cards
  get    'cards'                           => 'cards#recent'
  get    'cards/:id'                       => 'cards#show'

  # Users
  get    'users/:slug/votes'               => 'users#votes'
  get    'user/:slug/voting'               => 'users#needs_vote'

  root 'static#index' 

end
