class Api::MediaController < Api::BaseController

  before_action :find_authenticated_user, except: [:share_feed, :show]

  def create_vote

    unless @user
      render json: {error: "must be logged in to vote"}, status: :unauthorized
      return
    end 

    @vote = media_params[:vote] == 'up' ? true : false
    @user.voted_on << media_params[:id]

    vote = Vote.create(
      voter_type: 'User', 
      voter_id: @user.id, 
      votable_id: media_params[:id], 
      vote_flag: @vote, 
      votable_type: 'Media',
      vote_tag: media_params[:tag]
    )

    if vote
      IncrementMediaVoteCount.perform_async(media_params[:id], vote.vote_flag)
      render json: {success: "true"}
    else
      render json: {errors: "something went wrong: #{e}"}, status: :unprocessible_entity
    end
  end

  def share_feed
    tags = Array.new
    if media_params[:tag].include?(',')
      tags = media_params[:tag].delete'{}'
      tags = tags.split(',')
    else
      tags << media_params[:tag]
    end
    if Tag.blacklisted?(tags)
      render json: {errors: "This tag is not available in Safe Surf mode"}, status: :unauthorized
      return
    end

    @media = Media.next(
      @user, 
      tags, 
      {
        :id => media_params[:id], 
        :limit => media_params[:limit],
        :offset => media_params[:offset] 
      }
    )

    if @media.present?
      render json: @media, root: "data"
    else
      render json: {errors: 'no media found'}, status: :not_found
    end
  end

  def next
    unless @user
      render json: {errors: 'must be logged in to view feed.'}, status: :unauthorized
      return
    end

    tags = Array.new
    if media_params[:tag].include?(',')
      tags = media_params[:tag].delete'{}'
      tags = tags.split(',')
    else
      tags << media_params[:tag]
    end

    if @user.safe_mode? && Tag.blacklisted?(tags)
      render json: {errors: "This tag is not available in Safe Surf mode"}, status: :unauthorized
      return
    end
      
    @media = Media.next(@user, tags)
    if @media.present?
      render json: @media, root: "data"
    else
      render json: {errors: 'no media found'}, status: :not_found
    end
  end

  def show
    @media = Media.find(params[:id]) 
    if @media
      render json: @media, root: "data"
    else
      render json: {errors: 'no media found'}, status: :not_found
    end
  end

  def report
    media = Media.find params[:media_id]
    media.update_column "reported", true
    # SendReportedNotification.perform_async(current_user.id, media.id)
    if media.reported?
      render json: {success: true, media: media}, status: :ok
    else
      render json: {errors: "something went wrong"}, status: :unprocessible_entity
    end
  end

  def remove_report
    if current_user and current_user.admin?
      media = Media.unscoped.find(params[:media_id])
      media.update_column "reported", false

      if params[:nsfw]
        media.update_column "nsfw", true
      end

      if media.reported == false
        flash[:notice] = "Media #{params[:media_id]} unreported"
        redirect_to '/feed'
      else
        flash[:error] = "Could not report because of error"
        redirect_to '/feed'
      end

    else
      flash[:error] = "not authorized"
      redirect_to '/feed'
    end

  end

  private

    def media_params
      params.permit(:id, :vote, :tag, :offset, :limit)
    end

end
