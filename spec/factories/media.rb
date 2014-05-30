FactoryGirl.define do
  factory :media do
    image_link_original "http://i.imgur.com/vW5QZE1.png"  
    remote_id "vW5QZE1" 
    remote_provider 'imgur' 
    content_type "image/png"
    remote_score 1000
    ts_score 1000
    section "funny"
  end

  factory :media_2, class: Media do
    image_link_original "http://i.imgur.com/chicken.png"  
    remote_id "chicken" 
    remote_provider 'imgur' 
    content_type "image/png"
    remote_score 2000
    ts_score 2000
    section "funny"
  end


  factory :media_3, class: Media do
    image_link_original "http://i.imgur.com/foobaz.png"  
    remote_id "foobaz" 
    remote_provider 'imgur' 
    content_type "image/png"
    remote_score 3000
    ts_score 3000
    section "funny"
  end
end
