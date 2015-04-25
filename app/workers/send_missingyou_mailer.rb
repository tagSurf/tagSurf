class SendMissingyouMailer
  include Sidekiq::Worker
  include Sidetiq::Schedulable

  # 3am in PST
 #  recurrence { weekly.(11) }

	# def perform 

	# end


end