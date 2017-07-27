const pg = require('pg');
const _ = require('lodash');

const client = new pg.Client(process.env.DATABASE_URL);

// sync function
function sync(cb) {
  // drop tweets first
  var sql = `
    DROP TABLE IF EXISTS tweets;
    DROP TABLE IF EXISTS users;
    CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      first_name CHARACTER VARYING(20),
      last_name CHARACTER VARYING(20)
    );
    CREATE TABLE tweets(
      id SERIAL PRIMARY KEY,
      user_id int REFERENCES users(id),
      body CHARACTER VARYING(140),
      timestamp TIMESTAMP
    );
  `
  client.query(sql, function(err) {
    if (err) return cb(err.message);
    cb(null);
  })
}


// modify
function createUser(user, cb) {
  client.query("INSERT INTO users (first_name, last_name) VALUES ($1, $2) returning id", [user.firstName, user.lastName], function(err, result) {
    if (err) return cb(err.message);
    cb(null, result.rows[0].id);
  })
}

function deleteUser(user_id, cb) {
  // delete associated tweets first!
  client.query("DELETE FROM tweets WHERE user_id = $1", [user_id], function(err, result) {
    if (err) return cb(err);
    client.query("DELETE FROM users WHERE id = $1", [user_id], function(err, result) {
      if (err) return cb(err);
      cb(null);
    })
  })
}

function createTweet(user_id, body, cb) {
  client.query("INSERT INTO tweets (user_id, body) VALUES ($1, $2) returning id", [user_id*1, body], function(err, result) {
    if (err) return cb(err.message);
    cb(null, result.rows[0].id);
  })
}

function deleteTweet(id, cb) {
  client.query("DELETE FROM tweets WHERE id = $1", [id], function(err, result) {
    if (err) return cb(err);
    cb(null);
  })
}


// get
function getUsers(query, cb) {
  client.query("SELECT * FROM users", function(err, result) {
    if (err) return cb(err);
    cb(null, _.filter(result.rows, query));
  })
}

function getTweets(query, cb) {
  client.query("SELECT * from users JOIN tweets ON users.id=user_id", function(err, result) {
    if (err) return cb(err);
    cb(null, _.filter(result.rows, query));
  })
}


// seed
function seed(cb) {
  // need to use a latch? to prevent 5 callbacks here
  var counter = 4;  // for 5 callbacks
  createUser({ firstName: 'Bob', lastName: 'Ross' }, function(err, id) {
    if (err) return cb(err);
    createTweet(id, 'Bob Tweeting!!!', function(err) {
      if (err) return cb(err);
      counter == 0 ? cb(null) : counter--; // so the callback is called only once
    })
    createTweet(id, 'Bob Again!!!', function(err) {
      if (err) return cb(err);
      counter == 0 ? cb(null) : counter--;
    })
  })
  createUser({ firstName: 'Lara', lastName: 'Crafty' }, function(err, id) {
    if (err) return cb(err);
    createTweet(id, 'Lara Tweeting!!!', function(err) {
      if (err) return cb(err);
      counter == 0 ? cb(null) : counter--;
    })
  })
  createUser({ firstName: 'Paul', lastName: 'Bikey' }, function(err, id) {
    if (err) return cb(err);
    createTweet(id, 'Paul tweeting!!', function(err, tweet_id) {
      if (err) return cb(err);
      deleteTweet(tweet_id, function(err) {
        if (err) return cb(err);
        counter == 0 ? cb(null) : counter--;
      })
    })
  })
  createUser({ firstName: 'Colin', lastName: 'Runnin' }, function(err, id) {
    if (err) return cb(err);
    createTweet(id, 'Colin tweeting!!', function(err, tweet_id) {
      if (err) return cb(err);
      createTweet(id, 'Colin tweeting more!!', function(err, tweet_id) {
        if (err) return cb(err);
        deleteUser(id, function(err) {
          if (err) return cb(err);
          counter == 0 ? cb(null) : counter--;
        })
      })
    })
  })
}


client.connect();

module.exports = {
  sync,
  seed,
  getUsers,
  getTweets,
  createUser,
  deleteUser,
  createTweet,
  deleteTweet
}
