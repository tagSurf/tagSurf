Tagsurf::Application.routes.draw do

  get '/users/sign_up', to: redirect('/t/tag')

  devise_for :users, :controllers => { :sessions => 'sessions' }
 
  # Voting
  get 'votes/:id/:vote' => 'cards#add_vote'
  get 'cards/next/:tag' => 'cards#next'
  get 't/:tag'          => 'cards#vote'
  get 'u/history/:id'   => 'users#history'

  namespace :api do
    get  'tags'                          => 'tags#index'
    get  'tags/:name'                    => 'tags#show'
    post 'tags'                          => 'tags#create'
    get  'votes'                         => 'votes#show'
    get  'users/history/:limit/:offset'  => 'users#paginated_history'
    get  'history/bracketed/:id'         => 'users#bracketed_history'
    get  'history/next/:id'              => 'users#next_history'
    get  'history/previous/:id'          => 'users#previous_history'
    get  'votes/up'                      => 'votes#up'
    get  'votes/down'                    => 'votes#down'
    get  'stats'                         => 'votes#stats'
  end

  resources :cards
  resources :users
  root to: "static#index"

end
