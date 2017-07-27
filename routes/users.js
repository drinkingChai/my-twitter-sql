const router = require('express').Router();
const db = require('../db');


router.get('/', function(req, res) {
  db.getUsers({}, function(err, allUsers) {
    if (err) return console.log(err);
    res.render('users', { allUsers });
  })
})

router.delete('/:id', function(req, res) {
  db.deleteUser(req.params.id*1, function(err) {
    if (err) return console.log(err);
    res.redirect('/users');
  });
})



module.exports = router;
