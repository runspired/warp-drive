import { attr, belongsTo, hasMany } from 'ember-orm/schema';
import Ember from 'ember';

export default Ember.Object.extend({
  name: attr(),
  bar: belongsTo('bar', { inverse: 'foo' }),
  bards: hasMany('bar', { inverse: 'foods' }),
  bars: hasMany('bar', { inverse: 'foos' })
});
