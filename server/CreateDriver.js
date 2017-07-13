
const webdriver = require('selenium-webdriver'),
  chrome = require('selenium-webdriver/chrome'),
  chromePath = require('chromedriver').path;
/**
 * Create webdriver of browser instance
 * @returns {!webdriver.WebDriver}
 */

class CreateDriver {

  static firefox() {
    return new webdriver.Builder()
      .forBrowser('firefox')
      .build();
  };

  static chrome() {
    let service = new chrome.ServiceBuilder(chromePath).build();
    chrome.setDefaultService(service);
    let caps = webdriver.Capabilities.chrome();
    return new webdriver.Builder()
      .withCapabilities(caps)
      .build();
  };
}

module.exports = CreateDriver;

