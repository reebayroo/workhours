import guid from 'guid';
import _ from 'lodash';
import store from 'store';
import moment from 'moment';
class Model {
  constructor() {
    this.projects = store.get('projects') || [];
    this.hoursState = store.get('hourState') || null;
    this.month = [];
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
  getOrCreateHoursState() {
    this.hoursState = (!this.hoursState) ? this.createHoursState() : this.hoursState;
    return this.hoursState;
  }
  createHoursState() {
    let currentMonth = moment().format('MMMM');
    return {
      currentMonth: currentMonth,
      months: _.map(moment.months(), (m) => ({ label: m, selected: m === currentMonth }))
    };

  }

}
module.exports = Model;