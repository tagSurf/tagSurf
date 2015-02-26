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
      ref = Referral.unscoped.where(referrable_id: media_id, referrer_id: sharer, user_id: @user.id)
      unless ref.empty?
        ref_id = ref.first.id
        @bump = Bump.new(
          bumper_id: @user.id,
          bumper_type: "User",
          referral_id: ref_id,
          media_id: media_id,
          sharer_id: sharer,
          sharer_type: "User"
        )
        @success = @bump.save

        if @success
          SendBumpNotification.perform_async(sharer, @user.id, bump_params[:media_id])
        end
      end
    end 
    if @success
      render json: {created: true}, status: :ok
    elsif @bump 
      render json: {created: false, reason: @bump.errors.full_messages.first }, status: :not_implemented
    else 
      render json: {created: false, reason: "no referral found" }, status: :not_implemented
    end
  end

  private

    def bump_params
      params.permit(:media_id, :sharer_ids)
    end

end