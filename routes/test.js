var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('test/index', { title: 'Send test' });
});

router.get('/receiver', (req, res, next) => {
  res.render('test/receiver', { title: 'Receive test'});
});

module.exports = router;
