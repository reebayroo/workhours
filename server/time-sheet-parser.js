let _ = require('lodash');


function parse(data) {
  let timeSheet = JSON.parse(data);
  let dates = timeSheet.dates;
  return _.reduce(dates, (result, d) => {
    result[d.date] = _.reduce(d.entries, (memo, e) => {
      memo['projectName'] = e.name;
      memo['orderNumber'] = e.ticketNumber;
      memo['totalHours'] = e.total;
      let [startTime, endTime] = e.hours;
      memo['startTime'] = startTime;
      memo['endTime'] = endTime;
      return memo;
    }, {});
    return result;
  }, {});
}


module.exports = {
  parse: parse
};
