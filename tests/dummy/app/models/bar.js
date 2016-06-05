import { attr, oneToOne, hasMany } from 'ember-orm/schema';

export default {
  name: attr(),
  description: attr(),
  baz: oneToOne('baz', { inverse: 'bar' }),
  foos: hasMany('foo', { inverse: 'bar' })
};

