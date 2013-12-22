Tagsurf::Application.routes.draw do

  devise_for :users
  root 'static#index' 

end
