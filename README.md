[![Build Status](https://travis-ci.org/innowatio/iwwa-lambda-users.svg?branch=master)](https://travis-ci.org/innowatio/iwwa-lambda-users)
[![Dependency Status](https://david-dm.org/innowatio/iwwa-lambda-users.svg)](https://david-dm.org/innowatio/iwwa-lambda-users)
[![devDependency Status](https://david-dm.org/innowatio/iwwa-lambda-users/dev-status.svg)](https://david-dm.org/innowatio/iwwa-lambda-users#info=devDependencies)

# iwwa-lambda-users

Lambda for persisting user changes through API.

After cloning the repository, run `npm install` to install all dependencies.

### Configuration

The following environment variables are needed to configure the function:

- `MONGODB_URL`

### Run test

In order to run tests locally a MongoDB instance and a `MONGODB_URL` environment
param are needed.
Then, just run `npm run test` command.