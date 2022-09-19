var express = require('express')
var app = express();
const { Pool, Client } = require('pg')
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/dokku_development'


const pool = new Pool({
  connectionString: connectionString
});

app.set('port', (process.env.PORT || 3000))

app.get('/', function(request, response) {
  pool.connect((err, client, done) => {
    if (err) {
      response.send(`ERROR ${err.stack}`);
    } else {
      client.query('SELECT NOW() as now', (err,res) => {
        done();
        if (err) {
          response.send(`ERROR ${err.stack}`);
        } else {
          response.send(`<h1>Hello Friendsquest</h1> <p>from the postgres server at ${res.rows[0].now}`);
        }
      });
    }
  })
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
