def repo_branch
  `git rev-parse --abbrev-ref HEAD`.strip()
end

def commit_hash
  `git rev-parse HEAD`.strip()
end

def git_remote(env)
  `git remote -v`.split("\n").find { |line| line.start_with?(env) }
end

def heroku_app(env)
  git_remote(env).match(/:(.+).git/)[1]
end

def heroku_version(env)
  app = heroku_app(env)

  # this is required otherwise we get weird errors
  Bundler.with_clean_env do
    `heroku releases --app #{app}`.split("\n")[1].split(" ")[0]
  end
end

def tag_name(env, ver)
  if env == 'production'
    "heroku/#{ver}"
  else
    "heroku/#{env}/#{ver}"
  end
end

def remote_exists!(env)
  unless git_remote(env)
    puts "Doh. No remote for #{env}, you must add it first."
    puts
    puts "git remote add #{env} git@heroku.com:APPNAME.git"
    puts
    raise 'The remote you are pushing to does not exist!'
  end
end


namespace :deploy do
  def deploy(env, remote=nil)
    branch = repo_branch
    remote = env if remote == nil
    remote_exists!(remote)

    if branch == 'deploy'
      raise 'You are trying to push the deploy branch!!'
    end

    if env == 'production'
      #safety_string = 'Yes'
      #puts "=== Production push"
      #puts
      #puts "  'I don't always test my code. But when I do, I do it in production.'"
      #puts "    - Ancient proverb"
      #puts
      #puts "You are deploying against production. Are you sure you want to do this?"
      #begin
      #  print "Please type: '#{safety_string}': "
      #end while STDIN.gets.chomp != safety_string
      #puts "Okay, here we go!"
      #puts
    end

    hash = commit_hash

    puts "=== Checking out deploy branch"
    system "git checkout -B deploy"

    puts "=== Merging #{branch} into deploy"
    system "git merge #{branch} --no-edit"

    puts "=== Installing and compiling assets"
    system "bundle exec rake tmp:clear"
    `RAILS_ENV=#{env} bundle exec rake assets:precompile`
    unless $? == 0
      raise "Could not precompile assets!" 
    end

    system "git add -f public/assets"
    system "git commit -m 'Precompiling assets'"

    puts "=== Pushing to #{remote}"
    `git push -f #{remote} deploy:master`
    unless $? == 0
      raise "Push exited with non-zero status!" 
    end


    system "git checkout -"

    puts "=== Tagging release"
    ver = heroku_version(remote)
    tag = tag_name(remote, ver)
    system "git tag -a -m \"Pushed to #{remote}\n\
Branch: #{branch}\n\
Hash:   #{hash}\" #{tag} #{hash}"
    system "git push origin #{tag}"
    puts "Tagged #{tag}"

    puts "=== All done! Have a nice day :)"
  end

  desc "Checks if the repo is clean"
  task :clean! do
    `git diff --exit-code`
    unstaged_clean = ($? == 0)
    `git diff --cached --exit-code`
    staged_clean = ($? == 0)

    unless unstaged_clean and staged_clean
      raise 'You have uncommitted changes!'
    end
  end

  desc "Deploys the attached project to staging"
  task :staging => [:clean!] do
    deploy 'staging'
  end

  desc "Deploys the attached project to production"
  task :production => [:clean!] do
    deploy 'production'
  end
end

task :deploy do
  puts 'Usage: rake deploy:[staging or production]'
end
