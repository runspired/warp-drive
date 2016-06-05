/* jshint node:true */

// To use it create some files under `mocks/`
// e.g. `server/mocks/ember-hamsters.js`
//
// module.exports = function(app) {
//   app.get('/ember-hamsters', function(req, res) {
//     res.send('hello');
//   });
// };
var Store = require('./db/store/store');
var path = require('path');
var route = require('./db/generate-route');

module.exports = function(app, project) {
  var configPath = path.join(project.project.root, project.project.configPath());
  var config = require(configPath)(project.environment).mockServer || {};

  app.store = new Store(config);

  // Log proxy requests
  var morgan  = require('morgan');
  app.use(morgan('dev'));

  app.store.namespaces.forEach(function(name) {
    route(app, name);
  });

};
