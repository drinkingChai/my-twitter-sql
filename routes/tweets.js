const router = require('express').Router();
const db = require('../db');


router.get('/', function(req, res) {
  db.getTweets({}, function(err, allTweets ) {
    if (err) return console.log(err);
    res.render('tweets', { allTweets  });
  })
})

router.delete('/:id', function(req, res) {
  db.deleteTweet(req.params.id*1, function(err) {
    if (err) return console.log(err);
    res.redirect('/tweets');
  });
})



module.exports = router;
