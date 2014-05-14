Analytics = AnalyticsRuby      
Analytics.init({
    secret: 'j11tequxw2',       
    on_error: Proc.new { |status, msg| print msg } 
})
