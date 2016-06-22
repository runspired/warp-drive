import { attr, oneToOne, hasMany } from 'warp-drive/schema';

export default {
  name: attr(),
  description: attr(),
  baz: oneToOne('baz', { inverse: 'bar', autofetch: true  }),
  foos: hasMany('foo', { inverse: 'bar' , autofetch: true })
};

