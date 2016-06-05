import { attr, oneToOne } from 'ember-orm/schema';

export default {
  name: attr(),
  description: attr(),
  bar: oneToOne('bar', { inverse: 'baz' })
};
