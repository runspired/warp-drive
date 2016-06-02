import { attr, belongsTo, hasMany } from 'ember-orm/schema';

export default {
  name: attr(),
  foo: belongsTo('foo', { inverse: 'bar' }),
  foods: hasMany('foo', { inverse: 'bards' }),
  foos: hasMany('foo', { inverse: 'bars' })
};
