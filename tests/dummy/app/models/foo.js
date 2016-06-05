import { attr, belongsTo, hasMany } from 'ember-orm/schema';

export default {
  name: attr(),
  description: attr(),
  bar: belongsTo('bar', { inverse: 'foos' })
};
