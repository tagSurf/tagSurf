Tagsurf::Application.routes.draw do

  devise_for :users, :controllers => { :omniauth_callbacks => "omniauth_callbacks", :sessions => 'sessions' }

  # Voting
  get    'votes/:id/:vote'  => 'cards#add_vote'

  root   'cards#vote' 

end
