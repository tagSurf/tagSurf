require 'sidekiq/web'

Tagsurf::Application.routes.draw do

  authenticate :user, lambda { |u| u.admin? } do
    mount Sidekiq::Web => '/sidekiq'
  end

  devise_for :users, controllers: { 
                       registrations: 'registrations', 
                       sessions: 'sessions',  
                       passwords: 'passwords',
                       :omniauth_callbacks => "omniauth_callbacks"
                     }

  get 'users/sign_up', to: redirect('/sign-up')
 
  # Static Routes
  get 'feed'            => 'client#feed'
  get 'share/:tag'      => 'client#share'
  get 'share/:tag/:id'  => 'client#share'
  get 'history'         => 'client#history'
  get 'favorites'       => 'client#favorites'
  get 'submissions'     => 'client#submissions'
  get 'bumps'           => 'client#bumps'
  get 'tag'             => 'client#tag'
  get 'bump/:ref_id'    => 'client#bump'

  #Enable Push
  get 'push-enable/:user_id'  => 'client#push_enable'
  get 'push'                  => 'client#push'

  # Beta access flow, ordered by good path
  get 'code'               => 'client#access_code'
  get 'disclaimer'         => 'client#disclaimer'
  get 'terms'              => 'client#terms'
  get 'sign-up'            => 'client#signup'
  get 'resend'             => 'client#resend_link'
  get 'welcome'            => 'client#welcome'
  get 'selectusername'     => 'client#username_select'
    
  # Multi-step beta access flow
  post 'confirm-beta'              => 'client#confirm_beta_token'
  post 'confirm-disclaimer'        => 'client#disclaimer_agreement'
  post 'confirm-terms'             => 'client#terms_agreement'
  post 'sms'                       => 'sms#receive'

  # User routes
  put 'user'               => 'users#update'
  post 'authentication/from-native' =>  'users#from_native'

  # JSON API
  namespace :api do
  
    get 'card/:id' => 'media#show'

    # Media API
    get  'media/:tag'                       => 'media#next'
    get  'share/:tag/:id/:limit/:offset'    => 'media#share_feed'
    post 'media/:media_id/tags/:name/'      => 'tags#create'
    post 'media/:media_id/report'           => 'media#report'
    get  'media/:media_id/unreport'         => 'media#remove_report'

    # Tags API
    get  'tags'                          => 'tags#tag_feed'
    get  'tags/search'                   => 'tags#search'
    get  'tags/:name'                    => 'tags#show'

    # Vote API
    get  'votes'                         => 'votes#show'
    post 'votes/:vote/:id/tag/:tag'      => 'media#create_vote'

    # Users API
    get  'users/:id/stats'               => 'votes#stats'
    get  'users'                         => 'users#stats'
    get  'users/buddies'                 => 'users#buddies'
    patch  'users/:id'                   => 'users#update'
    get 'users/unsubscribe/:id/:type'    => 'users#unsubscribe'
    get 'users/check-name/:username'     => 'users#check_username'

    # History API
    get  'history/paginated/:limit/:offset'  => 'users#paginated_history'
    get  'history/bracketed/:id'             => 'users#bracketed_history'
    get  'history/next/:id'                  => 'users#next_history'
    get  'history/previous/:id'              => 'users#previous_history'

    # Favorites API
    get  'favorites/paginated/:limit/:offset'      => 'favorites#paginated_history'
    get  'favorites/bracketed/:id'                 => 'favorites#bracketed_history'
    get  'favorites/next/:id'                      => 'favorites#next_history'
    get  'favorites/previous/:id'                  => 'favorites#previous_history'
    post 'favorites/:card_id'                      => 'favorites#create'
    delete 'favorites/:card_id'                    => 'favorites#delete'

    # Referrals API
    get  'referral/made/paginated/:limit/:offset'         => 'referrals#paginated_collection_made'
    get  'referral/received/paginated/:limit/:offset'     => 'referrals#paginated_collection_received'
    post 'referral/:card_id/:user_ids'                    => 'referrals#create'
    post 'referral/:card_id/:referral_id'                 => 'referrals#bump'
    get 'referral/seen/:referral_id'                      => 'referrals#seen'

    #Bumps API
    post 'bump/:media_id/:sharer_ids'       => 'bumps#create'
    get 'bump/seen/:bump_id'                => 'bumps#seen'


  end

  get '/desktop' => 'client#desktop'

  root to: "client#index"

end
