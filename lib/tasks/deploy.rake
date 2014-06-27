APP = 'fscommunityapi'

def repo_branch
  `git rev-parse --abbrev-ref HEAD`.strip()
end

def commit_hash
  `git rev-parse HEAD`.strip()
end

def git_remote_v
  @git_remote_v ||= `git remote -v`
end

def git_remotes
  git_remote_v.scan(/^(.+)\t(.+) /).uniq
end

def git_remote(remote)
  git_remote_v.split("\n").find { |line| line.split("\t")[0] == remote }.split("\t")[1].split(' ')[0] rescue nil
end

def heroku_apps
  git_remote_v.scan(/^(.+)\t.+heroku\.com:(.+)\.git/).uniq
end

def heroku_app(remote)
  git_remote(remote).match(/:(.+).git/)[1]
end

def heroku_app_version(app)
  Bundler.with_clean_env do
    `heroku releases --app '#{app}'`.split("\n")[1].split(" ")[0]
  end
end

def tag_name(remote, ver)
  "heroku/#{remote}/#{ver}"
end

def tag_message(remote, ver)
  `git tag -n1 -l '#{tag_name(remote,ver)}'`
end

def remote_exists!(remote)
  unless git_remote(remote)
    puts "No remote for #{remote}, you must add it first."
    puts
    puts "    git remote add #{remote} git@heroku.com:APPNAME.git"
    puts
    abort
  end
end

def heroku_version
  # heroku-toolbelt/3.8.2 (x86_64-darwin13.0) ruby/2.1.2
  # heroku-gem/3.8.2 (x86_64-darwin13.0) ruby/2.1.2
  Bundler.with_clean_env do
    @heroku_version ||= `heroku version 2>&1`
  end
end

def has_heroku?
  @has_heroku ||= (heroku_version =~ /^heroku-.+?\/\d+\.\d+\.\d+/) == 0
end

def heroku_instructions
  <<EOF
You do not have the heroku toolbelt installed!
Simplest way to install if you have Homebrew:

    brew update
    brew install heroku

Or visit the website: https://toolbelt.heroku.com/
Or if you are really desperate: gem install heroku
EOF
end

namespace :deploy do
  def deploy(env, remote=nil)
    branch = repo_branch
    remote ||= env
    remote_exists!(remote)
    app = heroku_app(remote)

    unless has_heroku?
      puts heroku_instructions
      puts
      puts "You can still deploy, but the script can't tag or run migrations."
      puts
      puts 'Tip: Run `rake deploy:setup` to check your setup!'
      print "Continue with push (Y/n)? "
      if STDIN.gets.chomp.chr.downcase == 'n'
        puts 'Aborted'
        abort
      end
    end

    if branch == 'deploy'
      abort 'You are trying to push the deploy branch!!'
    end

    if env == 'production'
      if branch != 'master'
        abort 'You are deploying to production but your branch is not master!!'
      end

      safety_string = 'Yes'
      puts
      puts "=== Production push"
      puts
      puts "You are pushing to: #{git_remote(remote)}"
      puts
      puts "You are deploying against production. Are you sure you want to do this?"
      begin
        print "Please type: '#{safety_string}': "
      end while STDIN.gets.chomp != safety_string
      puts "Party!"
      puts
    end

    puts
    puts "=== Pulling in changes from origin/master onto #{branch}"
    puts `git pull --no-edit origin master`
    unless $? == 0
      system "git merge --abort"
      puts
      puts "Merge conflict! Merge master manually and try again."
      puts
      puts '    git pull origin master'
      puts
      abort
    end

    hash = commit_hash

    puts
    puts "=== Pushing to #{remote}"
    puts `git push -f #{remote} HEAD:master`
    unless $? == 0
      abort "Push exited with non-zero status!"
    end

    puts
    puts "=== Tagging release"
    if has_heroku?
      ver = heroku_app_version(app)
      tag = tag_name(remote, ver)
      system "git tag -a -m \"Pushed branch '#{branch}' to #{remote}.\n\
Branch: #{branch}\n\
Hash:   #{hash}\" #{tag} #{hash}"
      system "git push origin #{tag}"
      puts "Tagged #{tag}"
    else
      puts "Can't tag without heroku."
    end

    puts
    puts "=== Migrations"
    if has_heroku?
      print "Do you want to run migrations (y/N)? "
      if STDIN.gets.chomp.chr.downcase == 'y'
        Bundler.with_clean_env do
          system "heroku run rake db:migrate --app '#{app}'"
          system "heroku restart --app '#{app}'"
        end
      end
    else
      puts "Can't run migrations without heroku."
    end

    puts
    puts "=== All done! Have a nice day :)"
  end

  desc "Checks if the repo is clean"
  task :clean! do
    `git diff --exit-code`
    unstaged_clean = ($? == 0)
    `git diff --cached --exit-code`
    staged_clean = ($? == 0)

    unless unstaged_clean and staged_clean
      system "git status -s"
      puts
      abort 'You have uncommitted changes!'
    end
  end

  desc "Checks if the heroku remotes are correct"
  task :good_remotes! do
    bad_remotes = heroku_apps.reject { |remote, app| 
      puts "FREEDOM"
      puts remote
      puts app
      puts APP
      puts "FREEDOM"
      app.starts_with?(APP) 
    }.map(&:first)
    unless bad_remotes.empty?
      #abort "You have misconfigured git remotes: #{bad_remotes.join(', ')}"
    end
  end

  desc "Deploys the attached project to staging"
  task :staging => [:clean!, :good_remotes!] do
    deploy 'staging'
  end

  desc "Deploys the attached project to staging2"
  task :staging2 => [:clean!, :good_remotes!] do
    deploy 'staging', 'staging2'
  end

  desc "Deploys the attached project to production"
  task :production => [:clean!, :good_remotes!] do
    deploy 'production'
  end

  desc "Checks the latest releases of your heroku remotes"
  task :status do
    unless has_heroku?
      puts heroku_instructions
      abort
    end

    output = {}
    threads = []
    heroku_apps.each do |app|
      t = Thread.new(app) do |remote, app|
        Bundler.with_clean_env do
          output[remote] = `heroku releases -n5 --app '#{app}'`
        end
      end
      threads.push t
    end

    # fetch tags from origin to get branch information
    t = Thread.new() do
      `git fetch -q -t origin`
    end
    threads.push t

    threads.map(&:join)
    output.sort.each do |remote, output|
      v = output.match(/^(?:(v\d+)\s+Deploy )|(?:v\d+\s+Rollback to (v\d+)\s)/) rescue nil
      v = v[2] || v[1] rescue nil
      message = tag_message(remote, v) if v

      puts output
      puts (message.presence || "Could not find tag information for #{v}.")
      puts
    end
  end

  desc "Helps you setup heroku and git"
  task :setup do
    puts '=== Heroku setup'
    if has_heroku?
      Bundler.with_clean_env do
        puts 'Your heroku version should be up to date (3.8.2 at the time of writing):'
        puts heroku_version
        puts
        if heroku_version =~ /^heroku-gem/
          puts 'Note: You are using the heroku gem.'
          puts 'Unfortunately, if you have both the gem and the toolbelt, this script will use the gem.'
          puts 'If the gem is out of date, try running: gem update heroku'
          puts
        end
        puts 'If heroku asks for authentication here, please enter it.'
        puts 'A token will be saved in ~/.netrc, so you should only need to do this once.'
        puts
        system "heroku auth:whoami"
      end
    else
      puts heroku_instructions
    end

    puts
    puts '=== Git setup'
    bad_remotes = git_remotes.select { |name,url| url =~ /^https?:\/\//i }
    unless bad_remotes.empty?
      puts 'You should setup your Git remotes to use SSH, not HTTPS.'
      puts 'Your misconfigured remotes are:'
      puts bad_remotes.map { |remote| remote.join("\t") }
      puts
    end
    missing_remotes = %w(production staging staging2)-git_remotes.map(&:first)
    unless missing_remotes.empty?
      puts 'You should have the git remotes: production, staging and staging2.'
      puts "You are missing: #{missing_remotes.join(', ')}"
      puts
    end
    puts 'Git should not prompt you for a password (keychain is Ok), when you run'
    puts 'remote operations such as: git fetch --tags origin (running now)'
    puts
    system "git fetch --tags origin"
  end
end

task :deploy do
  puts 'Usage: rake deploy:[staging, staging2 or production]'
  puts '       rake deploy:status'
  puts '       rake deploy:setup'
end
