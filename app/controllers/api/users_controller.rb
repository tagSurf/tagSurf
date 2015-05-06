class Api::UsersController < Api::BaseController
    
  before_action :find_authenticated_user, except: :stats
  
  def paginated_history
    @offset = user_params["offset"].to_i
    @limit = user_params["limit"].to_i
    @voted = Vote.paginated_history(@user.id, @limit, @offset, @user.safe_mode) 
    if @voted
      render json: @voted, root: 'data'
    else
      render json: "Nothing here"
    end
  end

  def bracketed_history
    vote = Vote.where(votable_id: params[:id], voter_id: @user.id).first

    unless vote
      render json: {error: "no votes for media: #{params[:id]} and user" }, status: :not_found
      return
    end

    @media = Vote.bracketed_collection(vote)
    if @media.present?
      render json: @media, each_serializer: MediaSerializer, root: 'data'
    else
      render json: {error: 'no media found'}, status: :not_found
    end
  end

  def next_history
    vote = Vote.where(votable_id: params[:id], voter_id: @user.id).first

    unless vote
      render json: {error: "no votes for media: #{params[:id]} and user" }, status: :not_found
      return
    end

    @media = Vote.next_collection(vote)
    if @media.present?
      render json: @media, each_serializer: MediaSerializer, root: 'data'
    else
      render json: {error: 'no media found'}, status: :not_found
    end

  end

  def previous_history
    vote = Vote.where(votable_id: params[:id], voter_id: @user.id).first

    unless vote
      render json: {error: "no votes for media: #{params[:id]} and user" }, status: :not_found
      return
    end

    @media = Vote.previous_collection(vote)
    if @media.present?
      render json: @media, each_serializer: MediaSerializer, root: 'data'
    else
      render json: {error: 'no media found'}, status: :not_found
    end
  end

  def up
    @voted = @user.find_up_voted_items
    if @voted
      render json: @voted
    else
      render json: "no up voted items"
    end
  end

  def down
    @voted = @user.find_down_voted_items
    if @voted
      render json: @voted
    else
      render json: "no down voted items"
    end
  end

  def stats
    @user = current_user
    results = {:user => @user}
    if @user
      # results['total_votes'] = @user.find_voted_items.count
      # results['up_votes']    = @user.find_up_voted_items.count
      # results['down_votes']  = @user.find_down_voted_items.count
      results['unseen_bumps'] = Bump.unscoped.where(:sharer_id => @user.id, :seen => false).count
      results['unseen_referrals'] = Referral.unscoped.where(:user_id => @user.id, :seen => false).count
      render json: results
      @user.last_seen = Time.now
      @user.save
    else
      results[:user] = "not found"
      render json: results, status: :not_found
    end
    
  end
  
  def update
    if @user.update(user_params)
      render json: @user
    else
      render json: "could not be updated", :status => :unprocessible_entity
    end
  end

  def buddies
    render json: User.buddy_list(current_user.id)
  end

  def list
    render json: User.full_list
  end

  def unsubscribe
    user = User.find(params[:id])
    user.update_column "#{params[:type]}_mailers", false

    if user["#{params[:type]}_mailers"] == false
      flash[:notice] = "Unsubscribed from #{params[:type]} emails"
      redirect_to '/feed'
    else
      flash[:error] = "Could not unscubscribe because of error"
      redirect_to '/feed'
    end
  end

  def check_username
    username = params[:username].downcase
    user = User.where(:username => username).first
    if user.present?
      render :json =>  [:available => false, :message => "This username is already taken"]
    else
      render :json =>  [:available => true]
    end      
  end



  private

    def user_params
      params.permit(
        :user, 
        :safe_mode, 
        :slug, 
        :limit, 
        :offset, 
        :email, 
        :username,
        :first_name,
        :last_name,
        :confirm_feature_tour
      ) 
    end

end
