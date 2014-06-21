require "spec_helper"

describe Media do

  let(:user) { User.create!(
                 email: 'admin@example.com', 
                 password: '12345678', 
                 password_confirmation: '12345678', 
                 slug: '12345678', 
                 beta_user: true
               ) 
              }

  
  let(:media) { 
    Media.create!(
      image_link_original: "http://i.imgur.com/vW5QZE1.png",  
      remote_id: "vW5QZE1", 
      remote_provider: 'imgur', 
      content_type: "image/png",
      remote_score: 1000,
      ts_score: 0,
      section: "funny"
    )
  }

  let(:media_2) {
    Media.create!(
      image_link_original: "http://i.imgur.com/chicken.png",  
      remote_id: "chicken", 
      remote_provider: 'imgur', 
      content_type: "image/png",
      remote_score: 2000,
      ts_score: 10,
      section: "funny"
    )
  }

  let(:media_3) {
    Media.create!(
      image_link_original: "http://i.imgur.com/foobar.png",  
      remote_id: "foobaz", 
      remote_provider: 'imgur', 
      content_type: "image/png",
      remote_score: 3000,
      ts_score: 20,
      section: "funny"
    )
  }

  let(:voted_on_three) { Vote.create!(voter_id: user.id, voter_type: "User", votable_type: "Media", votable_id: media_3.id, vote_flag: true) }

  context :scaled_dimensions do
    
    it "should return {} when width is nil" do
      media
      response = media.scale_dimensions('small')
      expect(response).to eq({})
    end

    it "should scale dimensions to 320" do
      media.width = 1267
      media.height = 1267
      media.save
      response = media.scale_dimensions(320)
      expect(response).to eq({:width => 320, :height => 320})
    end

    it "should scale height to 174" do 
      media.width = 605 
      media.height = 330
      media.save
      response = media.scale_dimensions(320)
      expect(response).to eq({:width => 320, :height => 174})
    end

    it "should scale width to 307" do 
      media.width = 655
      media.height = 681 
      media.save
      response = media.scale_dimensions(320)
      expect(response).to eq({:width => 307, :height => 320})
    end

  end

  context :next do
    
    it "should order by ts_score then remote_score" do
      media
      media_2
      media_3
      voted_on_three
      
      media = Media.next(user, "funny") 
      expect(media.first.remote_id).to eq "chicken"
    end
  end

  context :resize_image_links do 
    it "creates a thumbnail image link" do
      expect(media.image_link_thumbnail).to eq("http://i.imgur.com/vW5QZE1t.png")
    end

    it "creates a tiny image link" do
      expect(media.image_link_tiny).to eq("http://i.imgur.com/vW5QZE1s.png")
    end

    it "creates a medium image link" do
      expect(media.image_link_medium).to eq("http://i.imgur.com/vW5QZE1m.png")
    end

    it "creates a large image link" do
      expect(media.image_link_large).to eq("http://i.imgur.com/vW5QZE1l.png")
    end

  end



end
