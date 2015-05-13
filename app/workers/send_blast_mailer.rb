class SendBlastMailer
  include Sidekiq::Worker

	def perform		
		User.all.select(:id).where('username IS NOT NULL').map { |u| u.id }.each do |u|
		  	BlastMailer.blast_mailer(u).deliver
		end
	end

end