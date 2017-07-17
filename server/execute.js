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
      .then(() => this.checkUser())
  }

  invokeBrowser() {
    return CreateDriver[this.browser]()
      .then((driverInstance) => this.driver = driverInstance)
      .then(() => this.waitTimeOut = new WaitTimeOut(this.driver))
      .then(() => this.getURL(this.url))
  }

  executeTimeSheet(timeSheet, submit) {
    return this.saveHours(timeSheet)
      .then(() => this.refreshPage())
      .then(() => this.validateTimeEntryAndSubmit(submit));
  }

  validateTimeEntryAndSubmit(submit) {
    let error;
    return new Promise((resolve, reject) => {
      if (!submit) {
        return resolve('Please review your saved hours. Thank You!');
      }
      let promise = _.map(days, (day) => {
        return this.click(Execute.dayBinder(day, null))
          .then(() => this.checkStatus(day))
          .then((status) => {
            this.hoursAlreadyWalked(status, day);

            if (status[2] === 'Saved Only') {
              status = _.filter(status, (s) => s !== '--');
              status.pop();

              let innerPromise = _.map(status, (s) => {
                if (parseInt(s) > 8) {
                  error = `You can not enter more than 8 hours. User tried: ${status[0]}`;
                  return Promise.resolve();
                } else if (parseInt(s) < 0) {
                  error = `You can not enter Zero hours. User tried: ${status[0]}`;
                  return Promise.resolve();
                } else {
                  //todo
                  return this.submitHours(day);
                }
              });
              return Promise.all(innerPromise);
            }
            console.log(status);
            return Promise.resolve();
          });
      });
      Promise.all(promise)
        .then(() => error ? reject(error) : resolve('Hours has been successfully entered into the System. Thank You!'))
        .catch(reject)
    })
  }

  submitHours(day) {
    return this.click(WebElements.SUBMIT_SAVED_HOURS)
      .then(() => this.handleAlert())
      .then(this.wait(500))
      .then(() => this.checkStatus(day))
      .then((status) => {
        if (status[1] !== 'Posted to E1' || status[1] !== 'Submitted and Approved') {
          //todo
          //throw `Hours not submitted for ${day}`;
        }
        return Promise.resolve();
      });
  }

  hoursAlreadyWalked(status, day) {
    if (status[2] === 'Posted to E1' || status[2] === 'Submitted and Approved' ||
        status[2] === 'Submitted to E1') {
      console.log(`Hours for ${day} has been already submitted to E1.`);
    }
  }

  saveHours(timeSheet) {
    return new Promise((resolve, reject) => {
      let promise = _.map(timeSheet, (days) => {
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

    let query = [Execute.dayBinder(day, 'span', 2), Execute.dayBinder(day, 'span', 3)];
    let promise = _.map(query, (element) => this.getElementText(element));

    return Promise.all(promise).then((hours) =>
      this.getElementText(WebElements.STATUS, 1000).then((status) => {
        hours.push(status);
        return hours;
      }).catch((error) => hours)).catch((error) => error);
  }

  checkUser() {
    return this.getElementText(WebElements.INVALID_USER, 1000)
      .then((text) => {
        if (text === 'The username or password is invalid.') {
          return { user: 'invalid', error: text };
        }
      }).catch((error) => Promise.resolve());
  }
}

module.exports = Execute;