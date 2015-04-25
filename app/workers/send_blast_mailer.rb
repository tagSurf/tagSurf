class SendBlastMailer
  include Sidekiq::Worker

	def perform		
		User.all.select(:id).where(:current_sign_in_at => 1.month.ago..Time.now).map { |u| u.id }.each do |u|
	  	BlastMailer.blast_mailer(u).deliver
		end
	end

end