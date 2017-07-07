// require('expose-loader?$!jquery');
require('jquery');

require('!style!css!../../semantic/dist/semantic.css');
require('!style!css!../stylesheets/override-style.css');
require('../../semantic/dist/components/dimmer');
require('../../semantic/dist/components/transition');
require('../../semantic/dist/components/tab');
require('jquery-number');
import Index from './index';


console.log('Client .js imported');


module.exports = {
  Index: Index
};