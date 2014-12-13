require File.expand_path('../boot', __FILE__)

require 'rails/all'

Bundler.require(:default, Rails.env)

CONFIG = {}

module Tagsurf

  class Application < Rails::Application
    config.assets.enabled = true
    config.autoload_paths += Dir["#{config.root}/lib/**/**/"]

  # Add sub manifests to list of precompiled assets
  config.assets.precompile += %w( gallery_page.js sessions.js signup.js welcome.js gallery_page.css sessions.css welcome.css )

    config.to_prepare do
        Devise::SessionsController.layout "client"
        Devise::RegistrationsController.layout "client"
        Devise::ConfirmationsController.layout "client"
        Devise::UnlocksController.layout "client"            
        Devise::PasswordsController.layout "client"        
    end

    config.action_mailer.default_url_options = { host: 'localhost:3000' }
    config.action_mailer.delivery_method = :smtp
    config.action_mailer.smtp_settings = {
      :address              => "smtp.gmail.com",
      :port                 => 587,
      :domain               => "tagsurf.co",
      :user_name            => "beta@tagsurf.co",
      :password             => ENV["TS_MAIL_SECRET"],
      :authentication       => 'plain',
      :enable_starttls_auto => true
    }

    config.action_mailer.perform_deliveries = true
    config.action_mailer.raise_delivery_errors = false

    # redis_active = Rails.env.development? ? false : true
    CONFIG[:redis_active] = true #redis_active  

    # TODO move to yaml
    CONFIG[:blacklisted_tags] = [ 
      "boobies", 
      "hot", 
      "sexy", 
      "sex", 
      "ass", 
      "naked", 
      "Naked", 
      "women", 
      "prettygirls", 
      "Celebs", 
      "Gentlemanboners", 
      "gentlemanboners",
      "gentlemenboners",
      "gentlemenboner", 
      "boobs", 
      "Sideboob", 
      "nsfw", 
      "nswf",
      "nsfw_gif", 
      "nsfw_gifs", 
      "realgirls", 
      "real girls", 
      "randomsexiness", 
      "gonewild", 
      "bdsm", 
      "slut", 
      "watchitfortheplot", 
      "yesplease", 
      "topheavy", 
      "slutsandwich", 
      "pretty", 
      "hugetitties", 
      "babygotback", 
      "babe", 
      "porn",
      "Pornlovers",
      "o_face",
      "bdsm",
      "fapfapfap",
      "wouldtotallyfuck",
      "ladyBoners",
      "dicks",
      "spacedicks",
      "confusedboners",
      "celebritypokies",
      "onoff",
      "adultgifs",
      "AmateurArchives",
      "amature",
      "amateur",
      "asstastic",
      "BBW",
      "BBWGW",
      "bigasses",
      "boobbounce",
      "boobgifs",
      "booty",
      "BubbleButts",
      "burstingout",
      "bustybabes",
      "buttplug",
      "cfnf",
      "chubby",
      "CollegeAmateurs",
      "collegensfw",
      "curvy",
      "facedownassup",
      "facesitting",
      "FFSocks",
      "Fisting",
      "FootFetish",
      "funsized",
      "ginger",
      "GirlsinLaceFishnets",
      "GirlsinStripedSocks",
      "GirlswithGlasses",
      "gonewildaudio",
      "gonewildcurvy",
      "GoneWildPlus",
      "Gravure",
      "HappyEmbarrasedGirls",
      "heavyhangers",
      "HighRestNSFW",
      "homegrowntits",
      "homemadexxx",
      "hugeboobs",
      "hugenaturals",
      "iWantToFuckHer",
      "jilling",
      "juicyasians",
      "latinas",
      "legs",
      "legsup",
      "londonandrews",
      "milf",
      "nakedcelebs",
      "nsfw2",
      "nsfwhardcore",
      "nsfwoutfits",
      "o_faces",
      "orgasms",
      "palegirls",
      "PiercedNSFW",
      "preggoPorn",
      "realolderwomen",
      "rape",
      "SceneGirls",
      "sexypantyhose",
      "sexystories",
      "shewantstofuck",
      "squirting",
      "Stacked",
      "stockings",
      "sweatermeat",
      "TallGirls",
      "tanlines",
      "TheUnderboob",
      "thick",
      "thighhighs",
      "tights",
      "TittyDrop",
      "torpedotits",
      "TwinGirls",
      "voluptuous",
      "bustypetite",
      "pussy",
      "thfappening",
      "asiansgonewild",
      "dick",
      "lesbians",
      "beef_lips",
      "butterfly_wings",
      "nfsw",
      "legalteens",
      "whore",
      "playboy",
      "penthouse",
      "fappening",
      "suicidegirls",
      "pornhub",
      "brunettes",
      "naked asians",
      "nakedasians",
      "balls",
      "fucking",
      "butts",
      "vagina",
      "cock",
      "cum",
      "orgasm",
      "oface",
      "faptogifs"
    ]

  end
end
