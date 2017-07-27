const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const nunjucks = require('nunjucks');
const db = require('./db');
const routes = require('./routes');


const app = express();

app.set('view engine', 'html');
app.engine('html', nunjucks.render);
nunjucks.configure('views', {
  express: app,
  noCache: true
})

app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));



app.get('/', function(req, res) {
  res.redirect('tweets');
})

app.get('/seed', function(req, res) {
  db.sync(function(err) {
    if (err) return console.log(err);
    db.seed(function(err) {
      if (err) return console.log(err);
      res.redirect('/');
    })
  })
})

app.use('/users', routes.users);
app.use('/tweets', routes.tweets);




const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log(`listening on port ${port}`);
  db.sync(function(err) {
    // the if statement checks if the value was a not null
    // on success, the value will be null in this case
    if (err) return console.log(err);
    db.seed(function(err) {
      if (err) return console.log(err);
      db.getUsers({}, function(err, users) {
        if (err) return console.log(err);
        console.log(users);
      })
      db.getTweets({}, function(err, tweets) {
        if (err) return console.log(err);
        console.log(tweets);
      })
    })
  });
})
