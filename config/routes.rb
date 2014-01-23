Tagsurf::Application.routes.draw do

  devise_for :users, :controllers => { :omniauth_callbacks => "omniauth_callbacks", :sessions => 'sessions' }
 
  # Voting
  get 'votes/:id/:vote'  => 'cards#add_vote'
  get 'cards/next' => 'cards#next'

  resources :cards
  root   'cards#vote'

end
