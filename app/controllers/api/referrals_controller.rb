class Api::ReferralsController < Api::BaseController

  before_filter :find_authenticated_user 

  def create
    @success = false
    users = Array.new
    if ref_params[:user_ids].include?(',')
      users = media_params[:user_ids].delete'{}'
      users = users.split(',')
      puts "#{users}"
    else
      users << ref_params[:user_ids]
    end
    users.each do |user|
      ref = Referral.new(
        referer_id: @user.id,
        referrer_type: "User", 
        referable_id: ref_params[:card_id],
        referable_type: "Media",
        user_id: user
      )
      @success = ref.save
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
