import { attr, oneToOne } from 'warp-drive/schema';

export default {
  name: attr(),
  description: attr(),
  bar: oneToOne('bar', { inverse: 'baz' })
};
