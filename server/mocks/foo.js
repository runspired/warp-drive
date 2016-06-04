/*jshint node:true*/
module.exports = function(app) {
  var express = require('express');
  var fooRouter = express.Router();

  fooRouter.get('/', function(req, res) {
    res.send({
      'foo': []
    });
  });

  fooRouter.post('/', function(req, res) {
    res.status(201).end();
  });

  fooRouter.get('/:id', function(req, res) {
    res.send({
      'foo': {
        id: req.params.id
      }
    });
  });

  fooRouter.put('/:id', function(req, res) {
    res.send({
      'foo': {
        id: req.params.id
      }
    });
  });

  fooRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  // The POST and PUT call will not contain a request body
  // because the body-parser is not included by default.
  // To use req.body, run:

  //    npm install --save-dev body-parser

  // After installing, you need to `use` the body-parser for
  // this mock uncommenting the following line:
  //
  //app.use('/api/foo', require('body-parser').json());
  app.use('/api/foo', fooRouter);
};
