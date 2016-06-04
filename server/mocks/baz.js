/*jshint node:true*/
module.exports = function(app) {
  var express = require('express');
  var bazRouter = express.Router();

  bazRouter.get('/', function(req, res) {
    res.send({
      'baz': []
    });
  });

  bazRouter.post('/', function(req, res) {
    res.status(201).end();
  });

  bazRouter.get('/:id', function(req, res) {
    res.send({
      'baz': {
        id: req.params.id
      }
    });
  });

  bazRouter.put('/:id', function(req, res) {
    res.send({
      'baz': {
        id: req.params.id
      }
    });
  });

  bazRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  // The POST and PUT call will not contain a request body
  // because the body-parser is not included by default.
  // To use req.body, run:

  //    npm install --save-dev body-parser

  // After installing, you need to `use` the body-parser for
  // this mock uncommenting the following line:
  //
  //app.use('/api/baz', require('body-parser').json());
  app.use('/api/baz', bazRouter);
};
