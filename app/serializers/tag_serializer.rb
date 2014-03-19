class TagSerializer < ActiveModel::Serializer
  self.root = false
  attributes :name
end
