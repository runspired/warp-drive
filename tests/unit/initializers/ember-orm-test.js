import Ember from 'ember';
import EmberOrmInitializer from 'dummy/initializers/ember-orm';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | ember orm', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  EmberOrmInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
