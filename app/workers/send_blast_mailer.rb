class SendBlastMailer
  include Sidekiq::Worker

	def perform		
		User.all.select(:id).map { |u| u.id }.each do |u|
	  	BlastMailer.blast_mailer(u).deliver
		end
	end

end