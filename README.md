# FriendsQuest API
 
A Node.js express application written in Typescript for the backend of the App "FriendsQuest".

## Requirements
* docker
* node ^16.17
* npm ^8

optional:
* nvm

## Important notes

* Always write `/index` at the end of the import path if you reference an index.ts file. This is necessary for the typescript compiler and `addJsExtensionToImports` script to work correctly.

## Getting started

You have two options: using the backend within or outside a docker container.

Hot reloading of the Node.js app is always turned on for `npm run start`.

Keep in mind to use ".js" for file extension. If you omit the extension, the application won't work because Typescript is used.

### Running with node in docker

```bash
# copy env file
$ cp .env.dist .env

# installing pre-commit hooks
$ npm install

# if running for the first time
$ docker-compose up --build

# afterwards
$ docker-compose up
```

Keep in mind that you have to rebuild the container when installing new dependencies.

### Running without node in docker
```bash
# copy env file
$ cp .env.dist .env

# if running for the first time
$ docker-compose up --build api

# afterwards
$ docker-compose up api

# second terminal
$ npm install
$ npm run dev
```

## Pre-commit hook with [Husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged)
Read carefully: it's pre-commit and not pre-push. See the difference in the official [git book](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks).
Because only well-formatted and standards-compliant code should be included in the repo,
we decided to format all edited files and check them using the linters.
If one linter finds any issue and isn't able to fix it by itself, you aren't able to commit your changes.
Take a look at the output of the linter(s) and fix the issue(s), so you can commit your changes.
If you want to check if your code is well-formatted and standards-compliant, you can manually run the scripts mentioned in the chapters below.

## Linter

### ESLint

ESLint is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.
Check out the [ESLint repo](https://github.com/eslint/eslint) for detailed explanations.

We take advantage of different packages to define our rules. Further information can be found in the `.eslintrc.cjs`.

### Usage

#### IDE / Code Editor

Be sure to enable ESLint in your preferences to get realtime feedback.

#### Identify wrong patterns

``` bash
# run ESLint
$ npm run lint
```

#### Let the linter(s) fix your problems

``` bash
# automatically fix all ESLint issues
$ npm run lint:fix
```

## Mikro-ORM

We access our PostgreSQL-Database through the ORM-Tool [Mikro ORM](https://mikro-orm.io/). Keep in mind your api docker container needs to run in order to access the local database.

### Migrations and Entities

Migrations are shipped by Mikro ORM. They are created automatically. Mikro ORM looks into the `entities` directory to create the migrations.

#### Creating a Migration

```bash
$ npm run migrate:create
```

#### Applying Migrations

```bash
# Migrate up to the latest version
$ npm run migrate:up
```

#### Reverse Migrations

```bash
# Migrate one step down
$ npm run migrate:down
```

#### Start new
```bash
# Drop the database and migrate up to the latest version
$ npm run migrate:fresh
```

### Seeders

You can create dummy data with Seeders. To create a new Seeder use `npm run seeder:create -- <EntityName>`. To run it: `npm run seeder:run`.

#### Fresh seeding
```bash
# Drop the database, migrate up to the latest version and afterwards seed the database
$ npm run orm:restart
```

## Pushing to FH system
```bash
$ git remote add dokku ssh://projects.multimediatechnology.at:5412/friendsquest
$ git push dokku main:main
```

## Health checks
In order to check if the API is running, you can use the health check endpoint `/health`. It returns `status: up` if the API is running.

### All endpoints
| ID        | Description                                            |
|-----------|--------------------------------------------------------|
| `info`    | Displays application information.                      |
| `metrics` | Shows metrics information for the current application. |
| `health`  | Shows application health information.                  |

## Conventional Commits

We use Conventional Commits. Have a look at the [summary](https://www.conventionalcommits.org/en/v1.0.0/#summary) in order to make great commits.
