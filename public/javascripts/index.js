import $ from 'jquery';
import moment from 'moment';
import _ from 'lodash';
import Model from './model';
import mustache from 'mustache';


var model = new Model(),
  projectsTemplate,
  hoursTemplate;


mustache.parse(projectsTemplate);
mustache.parse(hoursTemplate);

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

function refreshHours() {
  let hoursState = model.getOrCreateHoursState();
  console.log('hoursState ', hoursState);
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

function rebindProjects() {
  $('a.edit').click(editProject);
  $('a.trash').click(removeProject);
}

function rebindHours() {

}

function load() {
  projectsTemplate = $('#projectsTemplate').html();
  hoursTemplate = $('#hoursTemplate').html();
  // body...
  $('.tabular.menu .item').tab({
    'onVisible': (tabName) => {
      if (tabName === 'tabHours') refreshHours();
    }
  });
  $('.btn-save').click(save);

  console.log('moment.months()', moment.months());

  refreshProjects();
}
module.exports = {
  load: load
};