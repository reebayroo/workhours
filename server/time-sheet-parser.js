let _ = require('lodash');


function parse(data) {
  let timeSheet = JSON.parse(data);
  let dates = timeSheet.dates;
  return _.reduce(dates, (result, d) => {
    result[d.date] = _.reduce(d.entries, (memo, e) => {
      let [startTime, endTime] = e.hours;
      memo[e.name] = {
        projectName: e.name,
        orderNumber: e.ticketNumber,
        totalHours: e.total,
        startTime: startTime,
        endTime: endTime
      };
      return memo;
    }, {});
    return result;
  }, {});
}


module.exports = {
  parse: parse
};
