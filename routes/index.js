let express = require('express');
let router = express.Router();
let timeSheetParser = require('../server/time-sheet-parser');
let Execute = require('../server/execute');

const TIME_CARD_URL = 'http://time.tweddle.com/Account/Login';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Work Hours' });
});

function isJson(data) {
  try {
    JSON.parse(data);
  } catch (e) {
    return false;
  }
  return true;
}

router.post('/start', function(req, res, next) {
  let body = req.body,
    username = body.username,
    password = body.password,
    submitHours = body.submitHours,
    data = body.data;

  if (!username || !password || !data) {
    return res.json({ message: 'Please provide username password and time-sheet data!!' })
  }

  if (!isJson(data)) {
    return res.json({ message: 'Invalid Json!!' })
  }

  let timeCard = new Execute(TIME_CARD_URL, 'chrome');

  timeCard.authenticateUser(username, password)
    .then((message) => {
      if (message && message.user === 'invalid') {
        timeCard.quitBrowser();
        return res.json({ message: message.error })
      }
      timeCard.executeTimeSheet(timeSheetParser.parse(data), submitHours)
        .then((response) => {
          timeCard.quitBrowser();
          return res.json({ message: response })
        })
    })
    .catch((error) => {
      timeCard.quitBrowser();
      return res.json({ message: `Error: ${error}` })
    });
});

module.exports = router;