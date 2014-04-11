require 'sidekiq/web'

Tagsurf::Application.routes.draw do

  authenticate :user, lambda { |u| u.admin? } do
    mount Sidekiq::Web => '/sidekiq'
  end

  #get '/users/sign_up', to: redirect('/feed')

  devise_for :users, :controllers => { :sessions => 'sessions' }
 
  # Static Routes
  get 'feed'        => 'client#feed'
  get 'trending'    => 'client#trending'
  get 'favorites'   => 'client#favorites'
  get 'submissions' => 'client#submissions'
  get 'tag'         => 'client#tag'
  get 'history'     => 'client#tag'

  namespace :api do
    # Media API
    get 'media/:tag'   => 'media#next'

    # Tags API
    get  'tags'                          => 'tags#index'
    get  'tags/:name'                    => 'tags#show'
    post 'tags'                          => 'tags#create'

    # Vote API
    get  'votes'                         => 'votes#show'
    get  'votes/up/:media_id'            => 'votes#up'
    get  'votes/down/:media_id'          => 'votes#down'

    # Users API
    get  'users/:id/stats'               => 'votes#stats'

    # History API
    get  'history/paginated/:limit/:offset'  => 'users#paginated_history'
    get  'history/bracketed/:id'             => 'users#bracketed_history'
    get  'history/next/:id'                  => 'users#next_history'
    get  'history/previous/:id'              => 'users#previous_history'

    # Favorites API
    get  'favorites/bracketed/:id'       => 'favorites#bracketed_history'
    get  'favorites/next/:id'            => 'favorites#next_history'
    get  'favorites/previous/:id'        => 'favorites#previous_history'
    get  'favorites/:limit/:offset'      => 'favorites#paginated_history'
    post 'favorites/:card_id'            => 'favorites#create'
    delete 'favorites/:card_id'          => 'favorites#delete'
  end

  get '/desktop' => 'client#desktop'

  root to: "client#index"

end
