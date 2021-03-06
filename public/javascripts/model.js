import guid from 'guid';
import _ from 'lodash';
import store from 'store';
import beautify from 'json-beautify';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
const moment = extendMoment(Moment);

class Model {
  constructor() {
    this.projects = store.get('projects') || [];
    this.hoursState = store.get('hoursState') || null;
    this.timesheet = store.get('timesheet') || {};
    this.currentDay = moment();
  }
  addProject(name, ticketNumber) {
    this.projects.push({ name: name, ticketNumber: ticketNumber, _id: guid.raw() });
    store.set('projects', this.projects);
  }
  updateProject(id, name, ticketNumber) {
    let project = this.findById(id);
    _.merge(project, { name: name, ticketNumber: ticketNumber });
    store.set('projects', this.projects);
  }

  removeProject(projectId) {
    this.projects = _.filter(this.projects, (item) => item._id !== projectId);
    store.set('projects', this.projects);
  }
  findById(projectId) {
    return _.find(this.projects, (item) => item._id === projectId);
  }
  moveWeek(weekPosition) {
    this.currentDay.add(weekPosition, 'week');
    this.hoursState = this.createProjectHoursTable();
  }
  getProjectHoursTable() {
    this.hoursState = (!this.hoursState) ? this.createProjectHoursTable() : this.hoursState;
    this.decorateTimeSheet();
    return this.hoursState;
  }
  updateHours(id, date, value) {
    let dateEntry = this.timesheet[date] || { entries: {} };
    dateEntry.entries[id] = value;
    dateEntry.total = _.reduce(dateEntry.entries, (t, item) => t + item, 0);

    this.timesheet[date] = dateEntry;
    store.set('timesheet', this.timesheet);

  }
  createProjectHoursTable() {
    let currentMonth = this.currentDay.format('MMMM'),
      weekStart = this.currentDay.clone().subtract(this.currentDay.day(), 'days').clone(),
      weekEnd = this.currentDay.clone().subtract(this.currentDay.day(), 'days').add(6, 'days'),
      datesOnTheWeek = (callback) => _.map(_.range(7), (d) => callback(weekStart.clone().add(d, 'days')));

    return {
      currentMonth: currentMonth,
      months: _.map(moment.months(), (m) => ({ label: m, selected: m === currentMonth })),
      currentWeek: {
        label: `Week from ${weekStart.format('MM/DD')} to ${weekEnd.format('MM/DD')}`,
        start: weekStart.clone(),
        end: weekEnd.clone(),
        weekDaysLabels: datesOnTheWeek((d) => d.format('ddd MM/DD')),
        projects: _.map(this.projects, (p) => ({
          project: p,
          entries: _.map(_.range(7), (d) => ({
            hours: 0,
            date: weekStart.clone().add(d, 'days').format('MM-DD-YYYY')
          }))
        })),
        totals: datesOnTheWeek((d) => ({ date: d.format('MM-DD-YYYY'), total: 0 }))
      }
    };

  }
  decorateTimeSheet() {
    _.each(this.hoursState.currentWeek.projects, (projectEntry) => {
      _.chain(projectEntry.entries)
        .filter((entry) => this.timesheet[entry.date] && this.timesheet[entry.date].entries[projectEntry.project._id])
        .each((entry) => {
          entry.hours = this.timesheet[entry.date].entries[projectEntry.project._id];
        }).value();
    });
    _.chain(this.hoursState.currentWeek.totals)
      .filter((t) => this.timesheet[t.date])
      .each((t) => {
        t.total = this.timesheet[t.date].total;
      }).value();
  }
  generateReport() {

    let start = this.hoursState.currentWeek.start.clone().startOf('month'),
      end = this.hoursState.currentWeek.start.clone().endOf('month'),
      range = moment.range(start, end),
      convertProjects = (dayEntries, date) =>
        _.chain(_.keys(dayEntries.entries))
      .map((projectId) => this.findById(projectId))
      .map((project) => ({
        name: project.name,
        ticketNumber: project.ticketNumber,
        hours: [
          date.format('MM/DD/YYYY hh:mmA'), date.add(dayEntries.entries[project._id], 'hours')
            .format('MM/DD/YYYY hh:mmA')],
        total: dayEntries.entries[project._id],
      })).value(),
      dates = _.chain(Array.from(range.by('day')))
        .map((d) => d.format('MM-DD-YYYY'))
        .filter((d) => this.timesheet[d])
        .map((d) => ({
          date: d,
          entries: convertProjects(this.timesheet[d], moment(d + ' 9:00', 'MM-DD-YYYY HH:mm'))
        }))
        .value();

    return beautify({ month: this.hoursState.currentMonth, start: start, end: end, dates: dates }, null, 2, 100);
  }

}
module.exports = Model;