require "spec_helper"

describe Card do

  let(:user) { User.create!(
                 email: 'admin@example.com', 
                 password: '12345678', 
                 password_confirmation: '12345678', 
                 slug: '12345678', 
                 beta_user: true
               ) 
              }

  
  let(:card) { 
    Card.create!(
      image_link_original: "http://i.imgur.com/vW5QZE1.png",  
      remote_id: "vW5QZE1", 
      remote_provider: 'imgur', 
      content_type: "image/png",
      remote_score: 1000,
      ts_score: 0,
      section: "funny"
    )
  }

  let(:card_2) {
    Card.create!(
      image_link_original: "http://i.imgur.com/chicken.png",  
      remote_id: "chicken", 
      remote_provider: 'imgur', 
      content_type: "image/png",
      remote_score: 2000,
      ts_score: 10,
      section: "funny"
    )
  }

  let(:card_3) {
    Card.create!(
      image_link_original: "http://i.imgur.com/foobar.png",  
      remote_id: "foobaz", 
      remote_provider: 'imgur', 
      content_type: "image/png",
      remote_score: 3000,
      ts_score: 20,
      section: "funny"
    )
  }

  let(:voted_on_three) { Vote.create!(voter_id: user.id, voter_type: "User", votable_type: "Card", votable_id: card_3.id, vote_flag: true) }

  context :scaled_dimensions do
    
    it "should return {} when width is nil" do
      card
      reponse = card.scaled_dimensions('small')
      expect(reponse).to eq {}
    end

  end

  context :next do
    
    it "should order by ts_score then remote_score" do
      card
      card_2
      card_3
      voted_on_three
      
      cards = Card.next(user, "funny") 
      expect(cards.first.remote_id).to eq "chicken"
    end
  end

  context :resize_image_links do 
    it "creates a thumbnail image link" do
      expect(card.image_link_thumbnail).to eq("http://i.imgur.com/vW5QZE1t.png")
    end

    it "creates a tiny image link" do
      expect(card.image_link_tiny).to eq("http://i.imgur.com/vW5QZE1s.png")
    end

    it "creates a medium image link" do
      expect(card.image_link_medium).to eq("http://i.imgur.com/vW5QZE1m.png")
    end

    it "creates a large image link" do
      expect(card.image_link_large).to eq("http://i.imgur.com/vW5QZE1l.png")
    end

  end



end
