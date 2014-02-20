Tagsurf::Application.routes.draw do

  get '/users/sign_in', to: redirect('/')
  get '/users/sign_up', to: redirect('/')

  devise_for :users, :controllers => { :omniauth_callbacks => "omniauth_callbacks", :sessions => 'sessions' }
 
  # Voting
  get 'votes/:id/:vote' => 'cards#add_vote'
  get 'cards/next'      => 'cards#next'
  get 'cards/next/:tag' => 'cards#show'

  namespace :api do
    get  'tags'       => 'tags#index'
    get  'tags/:name' => 'tags#show'
    post 'tags'       => 'tags#create'
    get  'votes'      => 'votes#show'
    get  'votes/up'   => 'votes#up'
    get  'votes/down' => 'votes#down'
    get  'stats'      => 'votes#stats'
  end

  resources :cards
  root   'cards#vote'

end
