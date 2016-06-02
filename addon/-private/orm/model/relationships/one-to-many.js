// foo has many bars
// bar has a foo

import Relationship from './-relationship';

export class OneToMany extends Relationship {}

export function oneToMany(modelName, options = {}) {
  return new OneToMany(modelName, options);
}

export default oneToMany;
