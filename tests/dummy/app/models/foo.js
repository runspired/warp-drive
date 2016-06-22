import { attr, belongsTo, hasMany } from 'warp-drive/schema';

export default {
  name: attr(),
  description: attr(),
  bar: belongsTo('bar', { inverse: 'foos' })
};
