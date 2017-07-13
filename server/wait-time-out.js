
let webdriver = require('selenium-webdriver'),
  until = webdriver.until;

class WaitTimeOut {
  constructor(driver) {
    this.__driver = driver;
  }

  getElementWhenVisible(locator, time) {
    let timeOut = time || 10000;
    return this.__driver.wait(until.elementLocated(locator), timeOut, 'Could not locate WebElement with locator: ' + locator);
  }

  getElementsWhenVisible(locator, time) {
    let timeOut = time || 10000;
    return this.__driver.wait(until.elementsLocated(locator), timeOut, 'Could not locate WebElements with locator: ' + locator)
  }
}

module.exports = WaitTimeOut;
