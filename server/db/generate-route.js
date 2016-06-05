/*jshint node:true*/
var bodyParser = require('body-parser');

module.exports = function(app, modelName) {
  var express = require('express');
  var router = express.Router();

  router.get('/', function(req, res) {
    res.send(app.store.findAll(modelName));
  });

  router.post('/', function(req, res) {
    res.status(201).send(
      app.store.createRecord(modelName, req.body));
  });

  router.get('/:id', function(req, res) {
    res.send(
      app.store.findRecord(modelName, req.params.id));
  });

  router.put('/:id', function(req, res) {
    res.send(
      app.store.updateRecord(modelName, req.params.id, req.body));
  });

  router.delete('/:id', function(req, res) {
    app.store.deleteRecord(modelName, req.params.id);
    res.status(204).end();
  });

  app.use('/api/' + modelName + 's', bodyParser.json());
  app.use('/api/' + modelName + 's', router);
};
