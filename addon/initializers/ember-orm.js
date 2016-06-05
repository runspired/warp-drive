import ormGet from 'ember-orm/-private/ember-internals/get';
import Ember from 'ember';

export function initialize(/* application */) {
  Ember.get = ormGet;
  Ember.Object.prototype.get = function get(key) { return ormGet(this, key); };
}

export default {
  name: 'ember-orm',
  initialize
};
