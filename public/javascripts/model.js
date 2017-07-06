import guid from 'guid';
import _ from 'lodash';
import store from 'store';
import moment from 'moment';
class Model {
  constructor() {
    this.projects = store.get('projects') || [];
    this.hoursState = store.get('hoursState') || null;
    this.month = [];
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
    return this.hoursState;
  }
  createProjectHoursTable() {
    console.log('->', this.currentDay);
    let currentMonth = this.currentDay.format('MMMM'),

      weekStart = this.currentDay.clone().subtract(this.currentDay.day(), 'days').clone(),
      weekEnd = this.currentDay.clone().subtract(this.currentDay.day(), 'days').add(6, 'days');

    return {
      currentMonth: currentMonth,
      months: _.map(moment.months(), (m) => ({ label: m, selected: m === currentMonth })),

      currentWeek: {
        label: `Week from ${weekStart.format('MM/DD')} to ${weekEnd.format('MM/DD')}`,
        start: weekStart.clone(),
        end: weekEnd.clone(),
        weekDaysLabels: _.map(_.range(7), (d) => weekStart.clone().add(d, 'days').format('ddd MM/DD')),
        projects: _.map(this.projects, (p) => ({
          project: p,
          entries: _.map(_.range(7), (d) => ({
            hours: d,
            date: weekStart.clone().add(d, 'days').format('MM-DD-YYYY')
          }))
        })),
        totals: _.map(_.range(7), (d) => ({ total: d }))
      }
    };

  }

}
module.exports = Model;