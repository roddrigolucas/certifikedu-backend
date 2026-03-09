## Description

This is the API responsable for the backend of the CertifikEdu system.


## Environment setup

You need to create the environment file for development and for tests in the root directory. Both of them have the same format, except the DB for tests should have the port 5435. The dev file should be called .env while the tests environment file should be named .env.test

```.env

DATABASE_URL="postgresql://postgres:123@localhost:5434/nest?schema=public"

AWS_COGNITO_USER_POOL_ID="Cognito User Pool"
AWS_COGNITO_CLIENT_ID="Cognito App Client" 
AWS_COGNITO_AUTHORITY="https://cognito-idp.{ AWS_REGION }.amazonaws.com/{ COGNITO_POOL_ID }"
AWS_COGNITO_DOMAIN="Cognito Pool Domain"

VALID_HABILITIES="python,typescript"

```
## Installation

```bash
# Install basic packages
$ yarn install

# First Implementation: Create the DB service
$ yarn db:dev:up

# Restart the service so the migrations are applied
$ yarn db:dev:restart

# It's possible to populate the database before running the service 
$ npx prisma db seed

# It's possible to interact with the database through prisma
$ npx prisma studio

```

## Running the app

```bash
# Development watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Tests

So far only e2e tests is implemented. Make sure the .env.test file exist.


```bash
# On the first run the DB should be created
$ yarn db:test:up

# e2e tests
$ yarn test:e2e

# On the test db, seeds are applied automatically so the users can be retrieved from cognito
# however, prisma commands are still available if you point to the right env file.
$ dotenv -e .env.test -- prisma studio

```
## Usage

The dev service comes up in http://localhost:3000. The tests are in port 3333. There is a Swagger service up in /swagger with routes mapping and constraints.  

There are requests.http files in both users and certificates that can be used to requisition the server through VSCode. The extention REST Client is required.
