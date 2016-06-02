// bar has a foo
// foo has a bar

import Relationship from './-relationship';

export class OneToOne extends Relationship {}

export function oneToOne(modelName, options = {}) {
  return new OneToOne(modelName, options);
}

export default oneToOne;
