let CreateDriver = require('./CreateDriver'),
  WebElements = require('./Constants'),
  _ = require('lodash'),
  webdriver = require('selenium-webdriver'),
  By = webdriver.By,
  WaitTimeOut = require('./wait-time-out');

class Execute {

  constructor(url, browser) {
    this.url = url;
    this.browser = browser;
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
      let days = ['DOWmonday', 'DOWtuesday', 'DOWwednesday', 'DOWthursday', 'DOWfriday'];
      _.forEach(days, (day, i) => {
        this.click(Execute.dayBinder(day, null))
          .then(() => this.getElementText(Execute.dayBinder(day, 'span')))
          .then((savedHours) => {
            if (savedHours === '8.00') {
              // todo
            }
          }).then(() => i === _.size(days) ? (resolve) : '');
      })
    })
  }

  submitHours(timeSheet) {
    return new Promise((resolve, reject) => {
      _.forEach(timeSheet, (day, i) => {
        console.log(`Entering data for ${day}`);
        if (day.totalHours > 0) {
          this.sendData(WebElements.SEARCH_WORK_ORDER, day.orderNumber)
            .then(() => this.click(WebElements.SEARCH_BUTTON))
            .then(() => this.click(WebElements.TYPE_HEAD))
            .then(() => this.sendData(WebElements.START_DATE, day.startTime))
            .then(() => this.sendData(WebElements.END_DATE, day.endTime))
            .then(() => this.click(WebElements.SAVE_ENTRY))
            .then(() => i === _.size(timeSheet) ? (resolve) : '')
        }
      });
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

  static dayBinder(day, span) {
    return span ? By.xpath("//*[@id='" + day + "']//span[@class='DOWtime']") : By.xpath("//*[@id='" + day + "']//a");
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
}

module.exports = Execute;