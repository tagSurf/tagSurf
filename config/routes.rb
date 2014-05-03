require 'sidekiq/web'

Tagsurf::Application.routes.draw do

  authenticate :user, lambda { |u| u.admin? } do
    mount Sidekiq::Web => '/sidekiq'
  end

  devise_for :users, :controllers => { :registrations => 'registrations', :sessions => 'sessions' }

  get 'users' => 'client#index'
 
  # Static Routes
  get 'feed'        => 'client#feed'
  get 'favorites'   => 'client#favorites'
  get 'submissions' => 'client#submissions'
  get 'tag'         => 'client#tag'

  # Beta access flow, ordered by good path
  get 'code'        => 'client#access_code'
  get 'disclaimer'  => 'client#disclaimer'
  get 'terms'       => 'client#terms'
  get 'sign-up'     => 'client#signup'
  get 'resend'      => 'client#resend_link'
  get 'welcome'     => 'client#welcome'
    
  # Multi-step beta access flow
  post 'confirm-beta'              => 'client#confirm_beta_token'
  post 'confirm-disclaimer'        => 'client#disclaimer_agreement'
  post 'confirm-terms'             => 'client#terms_agreement'

  # User routes
  put 'user'                           => 'users#update'

  # JSON API
  namespace :api do

    # Media API
    get 'media/:tag'                     => 'media#next'

    # Tags API
    get  'tags'                          => 'media#tags'
    get  'tags/:name'                    => 'tags#show'
    post 'tags'                          => 'tags#create'

    # Vote API
    get  'votes'                         => 'votes#show'
    post 'votes/:vote/:id/tag/:tag'      => 'media#create_vote'

    # Users API
    get  'users/:id/stats'               => 'votes#stats'

    # History API
    get  'history/paginated/:limit/:offset'  => 'users#paginated_history'
    get  'history/bracketed/:id'             => 'users#bracketed_history'
    get  'history/next/:id'                  => 'users#next_history'
    get  'history/previous/:id'              => 'users#previous_history'

    # Favorites API
    get  'favorites/paginated/:limit/:offset'      => 'favorites#paginated_history'
    get  'favorites/bracketed/:id'       => 'favorites#bracketed_history'
    get  'favorites/next/:id'            => 'favorites#next_history'
    get  'favorites/previous/:id'        => 'favorites#previous_history'
    post 'favorites/:card_id'            => 'favorites#create'
    delete 'favorites/:card_id'          => 'favorites#delete'
  end

  get '/desktop' => 'client#desktop'

  root to: "client#index"

end
