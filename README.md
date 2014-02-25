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


### API Routes

Documents the API for the application.

# Users history (Authenticated)
```
# /api/users/history

## GET
+ Response 200 (text/plain)

        [
          {
            id: 2,
            remote_id: "vW5QZE1",
            remote_provider: "imgur",
            remote_created_at: "1970-01-01T00:00:00.000Z",
            link: "http://i.imgur.com/vW5QZE1.png",
            title: "I want to do good.",
            description: null,
            content_type: "image/png",
            animated: false,
            width: 800,
            height: 600,
            size: 41511,
            imgur_views: 71262,
            bandwidth: null,
            delete_hash: null,
            section: null,
            created_at: "2014-01-13T05:21:02.576Z",
            updated_at: "2014-01-13T05:21:02.576Z"
          }
        ]

```




