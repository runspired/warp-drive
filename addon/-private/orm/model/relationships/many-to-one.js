// foo has many bars
// bar has many foos

import Relationship from './-relationship';

export class ManyToOne extends Relationship {}

export function manyToOne(modelName, options = {}) {
  return new ManyToOne(modelName, options);
}

export default manyToOne;

