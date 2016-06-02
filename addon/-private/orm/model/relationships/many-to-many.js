// foo has many bars
// bar has many foos

import Relationship from './-relationship';

export class ManyToMany extends Relationship {}

export function manyToMany(modelName, options = {}) {
  return new ManyToMany(modelName, options);
}

export default manyToMany;

