class Tag < ActiveRecord::Base
  
  has_many :votes

  validates_presence_of :name

  default_scope where(:blacklisted => false)

  def self.blacklisted?(tag)
    CONFIG[:blacklisted_tags].include?(tag.downcase)
  end

  def self.populate_from_existing!
    sections = Card.pluck(:section)  
    available_tags = sections.uniq!
    available_tags.each do |name|
      Tag.create(name: name)
    end
  end

  def self.populate!
    Card.pluck(:section).uniq.each do |name|
      begin
        Tag.create(name: name)
      rescue ActiveRecord::RecordNotUnique => e
        next if(e.message =~ /unique.*constraint.*name/)
        raise "Something else happened #{e}"
      end
    end
  end

  def self.mega_tag!
    # create tagging associations for all cards with sections
  end

end
