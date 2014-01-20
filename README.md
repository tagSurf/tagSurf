tagSurf
=======

Uses oAuth 2.0 to authenticate imgur application users.

tagSurf beta app


## Setup

Rails 4.0
rbenv Ruby 2.0
Postgres 9.1.4

Uninteractive Development account on imgur requires development url to resolve at http://localhost:3000. This will be updated in the future to http://tagsurf.dev.

Create databases
example config/database.yml

```ruby
development:
  adapter: postgresql
  encoding: unicode
  database: tagsurf_development
  username:
  password:
  host: localhost
  port: 5432

test:
  adapter: postgresql
  encoding: unicode
  database: tagsurf_test
  username:
  password:
  host: localhost
  port: 5432
```

Setup and populate the DB
```
$ rake db:migrate
$ rake db:seed
$ rails server
```

Navigate to localhost:3000, authenitcate with imgur.com, and vote away.
