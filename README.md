<p align="center">
  <img src="https://res-4.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_256,w_256,f_auto,q_auto:eco/lfswynxziggdnjunyaxo" width="256" alt="Covee 2.0 Logo" />
</p>
<h1 align="center">Covee Network 2.0</h1>

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Documentation

Start the app and visit `/docs`.


## Docker containerization

Change directory to ```covee-saas-backend``` and execute:

1. Create Docker container
```
docker build . -t covee/saas-backend:latest
```

1. To run the frontend execute:
```
docker run -d -p 80:80 covee/saas-backend:latest
```
