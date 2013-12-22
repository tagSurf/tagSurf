Tagsurf::Application.routes.draw do

  devise_for :users
  root 'status#index' 

end
