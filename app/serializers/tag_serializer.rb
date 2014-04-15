class TagSerializer < ActiveModel::Serializer
  self.root = 'data'
  attributes :name
end
