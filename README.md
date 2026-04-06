# Election API

## Description

This is our NestJS API to serve the [GoodParty.org](https://goodparty.org) public election pages. It provides election data, candidate information, and related services for the public-facing election content.

## Project setup

```bash
npm install
```

Install the [node-gyp](https://github.com/nodejs/node-gyp#on-unix) prerequisites for your operating system

## Database Setup

Copy the environment file and configure your database connection:

```bash
cp .env.example .env
# Edit .env with your database URL
```

Run database migrations:

```bash
npm run migrate:dev    # For development
npm run migrate:deploy # For production
```

Generate Prisma client:

```bash
npm run generate
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Unit tests

Run:

```bash
# run once
$ npm run test

# watch mode
$ npm run test:watch
```

## Architecture

Built with NestJS and Fastify for high-performance API responses. Uses Prisma ORM for database access.

### Resources
https://github.com/kjhealy/fips-codes/tree/master