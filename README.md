<p align="center">
  <img src="https://res-4.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_256,w_256,f_auto,q_auto:eco/lfswynxziggdnjunyaxo" width="256" alt="Covee 2.0 Logo" />
</p>
<h1 align="center">Covee Network 2.0</h1>

## Usage

```bash

# prepare app
$ npm install
$ docker-compose up

# use for development (also watches for changes!)
$ npm run dev

# use for production
$ npm run build
$ npm run start
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

## OpenApi Spec

Start the app and visit `/docs` if you are a human , or `/docs-json` if you are a machine.

## App Structure

The app follows the principals of [domain-driven design](https://dddcommunity.org/learning-ddd/what_is_ddd/), i.e., placing the project's primary focus on the core domain and domain logic.


The app is divided into logical units, so called `modules`, each of which represents a bounded context. You will find the following modules:

- project 
- user
- notification
- app (no domain)
- shared (no domain, seedwork)
  - cache
  - config
  - email
  - event
  - object-mapper
  - object-storage
  - serialization
  - session
  - telemetry
  - token
  - typeorm
  - utility

Each module follows a 3 tier architecture:

![Dependencies between layers in DDD](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/media/ddd-oriented-microservice/ddd-service-layer-dependencies.png)

Figure from a [dotnet DDD microservice article](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice).

## FAQs

#### 1. How do I run all external dependencies?

You can use the supplied docker compose file. Just run:

```sh
$ docker-compose up --detach
```

#### 2. When I run `npm run dev`, I get the following error: 

```
Error: The postgres extension "pg_trgm" is not installed. An administrator should install the extension: "CREATE EXTENSION pg_trgm;"
```

 Connect to your local postgres intance (`psql postgres://covee-saas:password@localhost:5432/covee-saas`) and run `CREATE EXTENSION pg_trgm;`.

 #### 3. How do I override environment variables?

 Create an `.env` file and specify your custom environment variables. The `.env` file is ignored and will not be commited.