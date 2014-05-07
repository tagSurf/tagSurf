#  Desired behavior:
#
#  class VideoSerializer < BaseSerializer
#    time_attributes :uploaded_at
#  end
#
#  video = Video.new(uploaded_at: 3.days.ago)
#
#  s = VideoSerializer.new(video)
#
#  s.as_json[:uploaded_at    ] == video.uploaded_at.to_i
#  s.as_json[:uploaded_at_ago] == time_ago_in_words(video.uploaded_at)
#
class BaseSerializer < ActiveModel::Serializer
  include ActionView::Helpers::DateHelper
 
  class << self
 
    def time_attributes(*attrs)
      attrs.each do |attr|
        time_ago_attribute attr
        time_attribute attr
      end
    end
 
    def time_ago_attribute(attr, options={})
      method = "#{attr}_ago".to_sym
 
      unless method_defined?(method)
        define_method method do
          time = object.read_attribute_for_serialization(attr)
          time_ago_in_words(time) if time
        end
      end
 
      # attribute call must come after define_method, otherwise it will define its own method
      attribute method, options
    end
 
    def time_attribute(attr, options={})
      unless method_defined?(attr)
        define_method attr do
          time = object.read_attribute_for_serialization(attr)
          time.to_i if time
        end
      end
 
      attribute attr, options
    end
  end
end
