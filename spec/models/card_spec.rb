require "spec_helper"

describe Card do

  context :resize_image_links do 
    it "creates a thumbnail image link" do
      card = Card.create!(
        image_link_original: "http://i.imgur.com/vW5QZE1.png",  
        remote_id: "vW5QZE1", 
        remote_provider: 'imgur', 
        content_type: "image/png"
      )
      expect(card.image_link_thumbnail).to eq("http://i.imgur.com/vW5QZE1t.png")
    end

    it "creates a tiny image link" do
      card = Card.create!(
        image_link_original: "http://i.imgur.com/vW5QZE1.png",  
        remote_id: "vW5QZE1", 
        remote_provider: 'imgur', 
        content_type: "image/png"
      )
      expect(card.image_link_tiny).to eq("http://i.imgur.com/vW5QZE1s.png")
    end

    it "creates a medium image link" do
      card = Card.create!(
        image_link_original: "http://i.imgur.com/vW5QZE1.png",  
        remote_id: "vW5QZE1", 
        remote_provider: 'imgur', 
        content_type: "image/png"
      )
      expect(card.image_link_medium).to eq("http://i.imgur.com/vW5QZE1m.png")
    end

    it "creates a large image link" do
      card = Card.create!(
        image_link_original: "http://i.imgur.com/vW5QZE1.png",  
        remote_id: "vW5QZE1", 
        remote_provider: 'imgur', 
        content_type: "image/png"
      )
      expect(card.image_link_large).to eq("http://i.imgur.com/vW5QZE1l.png")
    end

  end



end
