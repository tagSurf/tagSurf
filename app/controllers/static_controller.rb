class StaticController < ApplicationController

  def index
    response = RemoteResource.get
    @hot_list = response.parsed_response["data"]
  end

end
