class Api::BumpsController < Api::BaseController

  before_filter :find_authenticated_user 

  def create
    @success = false
    sharers = Array.new
    media_id = bump_params[:media_id]

    if bump_params[:sharer_ids].include?(',')
      sharers = bump_params[:sharer_ids].delete'{}'
      sharers = sharers.split(',')
    else
      sharers << bump_params[:sharer_ids]
    end

    sharers.each do |sharer|
      ref = Referral.unscoped.where(media_id: media_id, referrer_id: sharer, user_id: @user.id)
      unless ref.empty?
        @success = Bump.bump_referral(ref.first.id)
      end
    end 
    if @success
      render json: {created: true}, status: :ok
    # elsif @bump 
    #   render json: {created: false, reason: @bump.errors.full_messages.first }, status: :not_implemented
    else 
      render json: {created: false, reason: "no referral found" }, status: :not_implemented
    end
  end

  def seen
    unless current_user.id != Bump.unscoped.find(params[:bump_id]).sharer_id
      @success = false
      bump = Bump.unscoped.find(bump_params[:bump_id])
      @success = bump.update_column('seen', true)
      if @success
        render json: {seen: true}, status: :ok
        # UpdateBadgeIcon.perform_async(current_user.id)
      else 
        render json: {created: false, reason: @success.errors }, status: :not_implemented
      end
      return
    end 
    render json: {created: false, reason: "not authorized"}, status: :not_implemented
  end 

  private

    def bump_params
      params.permit(:media_id, :sharer_ids, :bump_id)
    end

end