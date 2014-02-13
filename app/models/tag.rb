class Tag < ActiveRecord::Base

  def self.populate_from_existing!
    sections = Card.pluck(:section)  
    available_tags = sections.uniq!
    available_tags.each do |name|
      Tag.create(name: name)
    end
  end

  def self.mega_tag!
    # create tagging associations for all cards with sections
  end

end
