
Website for muscians to promte their songs.  We ran it for a few months, but didn't get traction so it was shutdown.

Co-developed with Luis Del Guidice.  We each wrote 50% of the code.

## Architecture

Back-end:  Django / Python

Front-end:  React.js

## Requirements:

* Node version 4.5
* PostgresSQL 9.5

## Install

`make install`
`make migrate`

To setup the database:
```
echo "CREATE USER submit WITH PASSWORD 'submit';" | psql postgres
echo "ALTER USER submit with SUPERUSER" | psql postgres
echo "GRANT ALL PRIVILEGES ON DATABASE submit to submit" | psql postgres
```

## Running

In one shell `make run` for backend Django webserver

In another shell `make watch` for front-end Node/React webserver




