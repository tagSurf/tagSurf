require 'sidekiq/web'

Tagsurf::Application.routes.draw do

  mount Sidekiq::Web => '/sidekiq'
  get '/users/sign_up', to: redirect('/t/tag')

  devise_for :users, :controllers => { :sessions => 'sessions' }
 
  # Voting
  get 'votes/:id/:vote' => 'cards#add_vote'
  get 'cards/next/:tag' => 'cards#next'
  get 't/:tag'          => 'cards#vote'
  get 'u/history/:id'   => 'users#history'

  namespace :api do

    # Tags API
    get  'tags'                          => 'tags#index'
    get  'tags/:name'                    => 'tags#show'
    post 'tags'                          => 'tags#create'

    # Vote API
    get  'votes'                         => 'votes#show'
    get  'users/history/:limit/:offset'  => 'users#paginated_history'
    get  'history/bracketed/:id'         => 'users#bracketed_history'
    get  'history/next/:id'              => 'users#next_history'
    get  'history/previous/:id'          => 'users#previous_history'
    get  'votes/up'                      => 'votes#up'
    get  'votes/down'                    => 'votes#down'
    get  'stats'                         => 'votes#stats'

    # Favorites API
    get  'favorites/bracketed/:id'       => 'favorites#bracketed_history'
    get  'favorites/next/:id'            => 'favorites#next_history'
    get  'favorites/previous/:id'        => 'favorites#previous_history'
    get  'favorites/:limit/:offset'      => 'favorites#paginated_history'
    post 'favorites/:card_id'            => 'favorites#create'
    delete 'favorites/:card_id'          => 'favorites#delete'
  end

  resources :cards
  resources :users

  get '/device' => 'static#device'
  get '/render_sidekiq' => 'static#render_sidekiq'

  root to: "static#index"

end
