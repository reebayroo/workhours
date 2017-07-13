let webdriver = require('selenium-webdriver'),
  By = webdriver.By;

module.exports = Object.freeze({
  USERNAME: By.id('Email'),
  PASSWORD: By.id('Password'),
  TIME_SHEET_LOGIN: By.xpath('//*[@value="Log in"]'),
  SEARCH_WORK_ORDER: By.id('search'),
  SEARCH_BUTTON: By.id('searchButton'),
  TYPE_HEAD: By.className('typeahead'),
  START_DATE: By.id('StartDate'),
  END_DATE: By.id('EndDate'),
  SAVE_ENTRY: By.id('btnSave'),
  SUBMIT_ENTRY: By.id('btnSubmit'),
  SUBMIT_SAVED_HOURS: By.xpath('//*[@class="text-right"]//button'),
  STATUS: By.xpath('//*[@class="tle-data-row"]/div[1]//span')
});