class Api::TagsController < ApplicationController

  def index
    render json: {data: ["All the tags"]}
  end

  def show
    render json: {tag: {name: "allthebetter"}}
  end

  def create
    render json: "you didn't create a tag yet"
  end

end
