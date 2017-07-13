let CreateDriver = require('./CreateDriver'),
  WebElements = require('./Constants'),
  _ = require('lodash'),
  webdriver = require('selenium-webdriver'),
  By = webdriver.By,
  Promise = require('bluebird'),
  WaitTimeOut = require('./wait-time-out');

const days = ['DOWmonday', 'DOWtuesday', 'DOWwednesday', 'DOWthursday', 'DOWfriday'];

class Execute {

  constructor(url, browser) {
    this.url = url;
    this.browser = browser;
    this.errors = [];
  }

  authenticateUser(username, password) {
    return this.invokeBrowser()
      .then(() => this.sendData(WebElements.USERNAME, username))
      .then(() => this.sendData(WebElements.PASSWORD, password))
      .then(() => this.click(WebElements.TIME_SHEET_LOGIN))
  }

  invokeBrowser() {
    return CreateDriver[this.browser]()
      .then((driverInstance) => this.driver = driverInstance)
      .then(() => this.waitTimeOut = new WaitTimeOut(this.driver))
      .then(() => this.getURL(this.url))
  }

  executeTimeSheet(timeSheet) {
    return this.submitHours(timeSheet)
      .then(() => this.refreshPage())
      .then(() => this.validateTimeEntryAndSubmit());
  }

  validateTimeEntryAndSubmit() {
    return new Promise((resolve, reject) => {
      let promise = _.map(days, (day) => {
        this.click(Execute.dayBinder(day, null))
          .then(() => this.checkStatus(day))
          .then((status) => {
            if (status[2] === 'Posted to E1' || status[2] === 'Submitted and Approved' ||
                status[2] === 'Submitted to E1') {
              throw `Hours for ${day} has been already entered.`;
            }
            if (status[2] === 'Saved Only') {
              status = _.filter(status, (s) => s !== '--');
              status.pop();
              let promise = _.map(status, (s) => {
                let hours = parseInt(s);
                if (hours > 8) {
                  throw `You can not enter more than 8 hours. User tried: ${status[0]}`;
                } else if (hours < 0) {
                  throw `You can not enter Zero hours. User tried: ${status[0]}`
                } else {
                  //todo
                  this.click(WebElements.SUBMIT_SAVED_HOURS)
                    .then(() => this.handleAlert())
                    .then(this.wait(500))
                    .then(() => this.checkStatus(day))
                    .then((status) => {
                      if (status[1] !== 'Posted to E1' || status[1] !== 'Submitted and Approved') {
                        //throw `Hours not submitted for ${day}`;
                      }
                      return Promise.resolve();
                    });
                }
              });
              return Promise.all(promise);
            }
            console.log(status);
            return Promise.resolve();
          });
      });
      Promise.all(promise).then(resolve, reject)
    })
  }

  submitHours(timeSheet) {
    return new Promise((resolve, reject) => {
      let promise = _.map(timeSheet, (days) => {
        //this.checkDayStatus(days);
        let innerPromise = _.map(days, (project) => {
          if (project.totalHours > 0) {
            return this.sendData(WebElements.SEARCH_WORK_ORDER, project.orderNumber)
              .then(() => this.click(WebElements.SEARCH_BUTTON))
              .then(() => this.click(WebElements.TYPE_HEAD))
              .then(() => this.sendData(WebElements.START_DATE, project.startTime))
              .then(() => this.sendData(WebElements.END_DATE, project.endTime))
              .then(() => this.click(WebElements.SAVE_ENTRY));
          }
        });
        return Promise.all(innerPromise);
      });
      Promise.all(promise).then(resolve, reject);
    })
  }

  sendData(locator, keys) {
    return this.waitTimeOut.getElementWhenVisible(locator).then(element => {
      element.clear();
      return element.sendKeys(keys)
    }).then(this.wait(500));
  }

  getURL(url) {
    return this.driver.get(url);
  }

  click(locator) {
    return this.waitTimeOut.getElementWhenVisible(locator)
      .then(element => element.click())
      .then(this.wait(500));
  }

  refreshPage() {
    return this.driver.navigate().refresh().then(this.wait(1000))
  }

  static dayBinder(day, span, type) {
    return span ? By.xpath(`//*[@id='${day}']//span[${type}]`) : By.xpath(`//*[@id='${day}']//a`);
  }

  getElementText(locator, timeOut = 10000) {
    return this.waitTimeOut.getElementWhenVisible(locator, timeOut)
      .then((element) => element.getText());
  }

  quitBrowser() {
    return this.driver.quit()
  }

  wait(ms) {
    return this.driver.sleep(ms)
  }

  handleAlert() {
    let alert = this.driver.switchTo().alert();
    alert.getText().then((text) => {
      console.log(`alert text: ${text}`);
      alert.accept();
    })
  }

  checkStatus(day) {
    let query = [Execute.dayBinder(day, 'span', 2), Execute.dayBinder(day, 'span', 3), WebElements.STATUS];
    let promise = _.map(query, (element) => this.getElementText(element));
    return Promise.all(promise).then((text) => text).catch((error) => error);
  }
}

module.exports = Execute;