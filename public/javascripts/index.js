import $ from 'jquery';
import Model from './model';
import mustache from 'mustache';
import axios from 'axios';
import _ from 'lodash';


let model = new Model(),
  projectsTemplate,
  hoursTemplate, totalsTemplate;


let editMode = {
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
  let self = $(this),
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

function generateReport() {
  let text = model.generateReport();
  /* this changes both the tab content and tab item */
  $('.ui.menu').find('.item').tab('change tab', 'tabReport');
  $('#reportText').val(text);
}

function rebindHours() {
  $('.previousWeek').click(moveWeek(-1));
  $('.nextWeek').click(moveWeek(1));
  $('input.hours').number(false, 0).change(registerHour);
  $('#generateButton').click(generateReport);
}

function setLoading(flag) {
  flag ? $('#loader').show() : $('#loader').hide();
}

function submitHours(data) {
  let username = $('#userName').val(),
    password = $('#password').val(),
    //data = $('#reportText').val(),
    submitHours = $('#submit').html() === 'Submit Hours';
  let pathname = window.location.origin;
  setLoading(true);
  return axios.post(`${pathname}/start`, {
    username: username,
    password: password,
    data: data,
    submitHours: submitHours
  }).then((res) => {
      setLoading(false)
      $('#successMessage').show();
      $('#message').empty().append(res.data.message);
    })
    .catch((error) => {
      setLoading(false)
      $('#errorMessage').show();
      $('#error').empty().append(error);
    });
}

function generateReportAndSubmit() {
  let text = model.generateReport();
  /* this changes both the tab content and tab item */
  $('#reportText').val(text);
  submitHours(text);
}

function bindSubmitHours() {

  let tabs = ['tabHours', 'tabProject', 'tabReport'];
  _.map(tabs, (tab) => {
    $(`.item[data-tab=${tab}]`).click(() => {
      tab === 'tabHours' ? $('#submition').show() : $('#submition').hide()
    })
  })


  $('#submit').click(() => generateReportAndSubmit());
  $('#clear').click(function() {
    $('#successMessage').hide();
    $('#errorMessage').hide();
    $('#userName').val('');
    $('#password').val('');
    $('#reportText').val('');
    $('#error').empty();
  });

  $('#submitHoursCheckbox').click(function() {
    if ($(this).is(':checked')) {
      $('#submit').html('Submit Hours');
    } else {
      $('#submit').html('Save Hours');
    }
  });
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
  bindSubmitHours();
}
module.exports = {
  load: load
};