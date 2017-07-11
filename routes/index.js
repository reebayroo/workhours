let express = require('express');
let router = express.Router();
let timeSheetParser = require('../server/time-sheet-parser');
let Execute = require('../server/execute');

const TIME_CARD_URL = 'http://time.tweddle.com/Account/Login';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Work Hours' });
});

router.post('/start', function(req, res, next) {
  let body = req.body,
    username = body.username,
    password = body.password,
    data = body.data;

  if (!username || !password || !data) {
    return res.json({ message: 'Please provide username password and time-sheet data!!' })
  }

  let timeCard = new Execute(TIME_CARD_URL, 'chrome');

  return timeCard.authenticateUser(username, password)
    .then(() => timeCard.executeTimeSheet(timeSheetParser.parse(data)))
    .then((response) => res.json({ message: 'Hours has been successfully entered into the System.' }))
    .catch((error) => {
      //timeCard.quitBrowser();
      return res.json({ message: `Error: ${error}` })
    });
});

module.exports = router;