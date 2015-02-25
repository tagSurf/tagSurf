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
      @ref = Referral.new(
        referrer_id: @user.id,
        referrer_type: "User", 
        referrable_id: ref_params[:card_id],
        referrable_type: "Media",
        user_id: user
      )
      @success = @ref.save
      if @success
        SendReferNotification.perform_async(user, @user.id, ref_params[:card_id])
      end
    end
    if @success
      render json: {created: true}, status: :ok
    else
      render json: {created: false, reason: @ref.errors.full_messages.first }, status: :not_implemented
    end
  end

  private

    def ref_params
      params.permit(:card_id, :user_ids)
    end

end
