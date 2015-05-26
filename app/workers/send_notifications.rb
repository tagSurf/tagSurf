class SendNotifications
  include Sidekiq::Worker
  include Sidetiq::Schedulable

  sidekiq_options :retry =>  3

  recurrence { hourly.minute_of_hour(0, 15, 30, 45) }

  def perform
  	User.all.each do |u|
  		unless u.notifications.empty?
  			u.notifications.each_key {|u_id| 
  				n = eval(u.notifications[u_id])
  				@user = User.find(u_id)
  				badge_number = Referral.unscoped.where(:user_id => u.id, :seen => false).count +
						Bump.unscoped.where(:sharer_id => u.id, :seen => false).count

					unless n[:referrals].nil?
						message = n[:referrals] == 1 ? "@#{@user.username} bumped something to you!" : "@#{@user.username} bumped #{n[:referrals]} things to you!"

						notification = {
							:aliases => [u.id],
							:aps => {:alert => message, :badge => badge_number}
						}
		
						Urbanairship.push(notification)
					end

					unless n[:bumps].nil?
						message = n[:bumps] == 1 ? "@#{@user.username} bumped it back!" : "@#{@user.username} bumped #{n[:bumps]} of your shares!"

						notification = {
							:aliases => [u.id],
							:aps => {:alert => message, :badge => badge_number}
						}
		
						Urbanairship.push(notification)
					end

					u.notifications.delete(u_id)
  			}
  		end
  	end
  end

end