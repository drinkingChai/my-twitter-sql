const express = require('express');
const db = require('./db');

const app = express();

const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log(`listening on port ${port}`);
  db.sync(function(err) {
    // the if statement checks if the value was a not null
    // on success, the value will be null in this case
    if (err) return console.log(err);
    db.seed(function(err) {
      if (err) return console.log(err);
      db.getAllUsers(function(err, users) {
        if (err) return console.log(err);
        console.log(users);
      })
      db.getAllTweets(function(err, tweets) {
        if (err) return console.log(err);
        console.log(tweets);
      })
    })
  });
})
