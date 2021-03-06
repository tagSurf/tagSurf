class Api::ReferralsController < Api::BaseController

  before_filter :find_authenticated_user 

  def create
    @success = false
    users = Array.new
    if ref_params[:user_ids].include?(',')
      users = ref_params[:user_ids].delete'{}'
      users = users.split(',')
    else
      users << ref_params[:user_ids]
    end
    users.each do |user|
      unless @user.id == user.to_i
        @ref = Referral.new(
          referrer_id: @user.id,
          referrer_type: "User", 
          media_id: ref_params[:card_id],
          referrable_type: "Media",
          user_id: user
        )
        @success = @ref.save
      end
    end
    if @success
      render json: {created: true}, status: :ok
    elsif @ref
      render json: {created: false, reason: @ref.errors.full_messages.first }, status: :not_implemented
    else
      render json: {created: false, reason: "can't refer to yourself!" }, status: :not_implemented
    end
  end

  def paginated_collection_made
    @offset = ref_params["offset"].to_i
    @limit = ref_params["limit"].to_i
    @user = current_user

    # limit responses to 50 cards
    if @limit > 50
      @limit = 50
    end

    @media = Referral.paginated_collection_made(@user.id, @limit, @offset, @user.safe_mode)
    if @media
      render json: @media, root: 'data'
    else
      render json: "Nothing here"
    end
  end

  def paginated_collection_received
    @offset = ref_params["offset"].to_i
    @limit = ref_params["limit"].to_i
    @user = current_user

    # limit responses to 50 cards
    if @limit > 50
      @limit = 50
    end

    @media = Referral.paginated_collection_received(@user.id, @limit, @offset, @user.safe_mode)
    if @media
      render json: @media, root: 'data'
    else
      render json: "Nothing here"
    end
  end

  def seen
    unless current_user.id != Referral.unscoped.find(params[:referral_id]).user_id
      @success = false
      ref = Referral.unscoped.find(params[:referral_id])
      @success = ref.update_column('seen', true)
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

    def ref_params
      params.permit(:card_id, :user_ids, :limit, :offset)
    end

end
