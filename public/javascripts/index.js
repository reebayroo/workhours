import $ from 'jquery';
import moment from 'moment';
import _ from 'lodash';
import Model from './model';
import mustache from 'mustache';


var model = new Model(),
  projectsTemplate,
  hoursTemplate, totalsTemplate;


var editMode = {
    save: () => {

      model.updateProject(
        $('#projectId').val(),
        $('#projectName').val(),
        $('#projectTicketNumber').val());
    }
  },
  insertMode = {
    save: () => {
      model.addProject($('#projectName').val(),
        $('#projectTicketNumber').val());
    }
  },
  currentMode = insertMode;

function save() {
  currentMode.save();
  $('input').val('');
  currentMode = insertMode;
  refreshProjects();
}

function refreshTotals() {

  let hoursState = model.getProjectHoursTable();

  let processedHtml = mustache.render(totalsTemplate, {
    currentWeek: hoursState.currentWeek
  });
  $('#totalsTemplateTarget').html(processedHtml).ready(rebindHours);
}

function refreshHours() {
  let hoursState = model.getProjectHoursTable();
  let processedHtml = mustache.render(hoursTemplate, {
    months: hoursState.months,
    week: hoursState.currentWeek,
    hours: hoursState.hours,
    currentWeek: hoursState.currentWeek
  });
  $('#hoursTemplateTarget').html(processedHtml).ready(rebindHours);
}

function refreshProjects() {
  let processedHtml = mustache.render(projectsTemplate, {
    projects: model.projects
  });
  $('#projectsTemplateTarget').html(processedHtml).ready(rebindProjects);
}

function removeProject(e) {
  let id = $(this).data('id');
  model.removeProject(id);
  e.stopPropagation();
  refreshProjects();
}

function editProject(e) {
  let id = $(this).data('id'),
    project = model.findById(id);
  currentMode = editMode;

  $('#projectId').val(project._id);
  $('#projectName').val(project.name);
  $('#projectTicketNumber').val(project.ticketNumber);

}

function moveWeek(weekPosition) {
  return () => {
    model.moveWeek(weekPosition);
    refreshHours();
  };
}

function registerHour() {
  var self = $(this),
    value = !!self.val() && parseInt(self.val(), 10) > 0 ? parseInt(self.val(), 10) : 0,
    date = self.data('date'),
    project = self.data('project');

  self.val(value);
  model.updateHours(project, date, value);
  refreshTotals();

}

function rebindProjects() {
  $('a.edit').click(editProject);
  $('a.trash').click(removeProject);
}

function rebindHours() {
  $('.previousWeek').click(moveWeek(-1));
  $('.nextWeek').click(moveWeek(1));
  $('input.hours').number(false, 0).change(registerHour);
}

function load() {
  projectsTemplate = $('#projectsTemplate').html();
  hoursTemplate = $('#hoursTemplate').html();
  totalsTemplate = $('#totalsTemplate').html();

  mustache.parse(projectsTemplate);
  mustache.parse(hoursTemplate);
  mustache.parse(totalsTemplate);

  // body...
  $('.tabular.menu .item').tab({
    'onVisible': (tabName) => {
      if (tabName === 'tabHours') refreshHours();
    }
  });
  $('.btn-save').click(save);


  refreshProjects();
}
module.exports = {
  load: load
};