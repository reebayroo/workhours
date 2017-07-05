var _ = require('lodash'),
  moment = require('moment');
const MONTH = 6;
const IDNONCHARGE = '1403751';
const RND = '2898273';
const NISSAN = '2898270';

var monthDays = _.map(_.range(1, 31), (m) => _.padStart(m, 2, '0'));

var pattern = [
  [RND, 3],
  [NISSAN, 5]
];
var startingDays = _.chain(monthDays).map((m) => moment(`${MONTH}/${m}/2017 09:00`, 'M/DD/YYYY HH:mm', true)).filter((m) => m.day() % 6 !== 0).value();


var entries = _.map(startingDays,
  (d) => _.reduce(pattern,
    (memo, item) => {
      let startPoint = memo.length ? moment(_.last(memo).end, 'MM/DD/YYYY H:mm A') : moment(d),
        endPoint = moment(startPoint).add(item[1], 'hour');

      memo.push({
        workOrder: item[0],
        start: startPoint.format('MM/DD/YYYY H:mm A'),

        end: endPoint.format('MM/DD/YYYY H:mm A')
      });
      return memo;
    }, []));

var all = _.each(entries, (entriesDay) => {
  _.each(entriesDay, (e) => {
    console.log(e.workOrder, _.padEnd(e.start, 20), e.end);
  });
});