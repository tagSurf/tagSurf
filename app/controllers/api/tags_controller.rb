class Api::TagsController < Api::BaseController

  def index
    render json: Tag.all
  end

  def show
    render json: Tag.where(name: tag_params["name"]).first 
  end

  def create
    render json: "you didn't create a tag yet"
  end

  private

    def tag_params
      params.permit(:name) 
    end

end
