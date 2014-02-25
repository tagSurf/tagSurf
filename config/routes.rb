Tagsurf::Application.routes.draw do

  get '/users/sign_up', to: redirect('/')

  devise_for :users, :controllers => { :sessions => 'sessions' }
 
  # Voting
  get 'votes/:id/:vote' => 'cards#add_vote'
  get 'cards/next'      => 'cards#next'
  get 'cards/next/:tag' => 'cards#show'
  get 't/:tag'          => 'cards#vote'
  get 't/hot'           => 'cards#vote'

  namespace :api do
    get  'tags'       => 'tags#index'
    get  'tags/:name' => 'tags#show'
    post 'tags'       => 'tags#create'
    get  'votes'      => 'votes#show'
    get  'users/history' => 'users#history'
    get  'votes/up'   => 'votes#up'
    get  'votes/down' => 'votes#down'
    get  'stats'      => 'votes#stats'
  end

  resources :cards
  resources :users
  root to: "static#index"

end
