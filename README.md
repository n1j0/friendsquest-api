# node-js-sample

A barebones Node.js app using [Express 4](http://expressjs.com/).

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and dokku-cli installed (gem install dokku-cli)

Your app should be able to run on [localhost:5000](http://localhost:5000/).

## Deploying to Dokku

```
git remote add dokku ssh://dokku@projects.multimediatechnology.at:5412/<PROJECTNAME>
git push dokku master
# open https://<PROJECTNAME>.projects.multimediatechnology.at
```

## Important Configuration

1) Read Environment Variables in your node app:

* $PORT  (process.env.PORT in node.js) = port number you should bind to
* $DATABASE_URL  (process.env.DATABASE_URL) = information on connecting to database

2) Set Node and npm version in package.json

3) Make sure the buildpack is set:

    dokku config:set BUILDPACK_URL=https://github.com/heroku/heroku-buildpack-nodejs
