// bar has a foo
// foo has no bar

import Relationship from './-relationship';
import { singularize } from 'ember-inflector';

export class OneToNone extends Relationship {

  recalc() {
    this.inverse = null;
    this.modelName = this.modelName || singularize(this.prop);
  }

}

export function oneToNone(modelName, options = {}) {
  return new OneToNone(modelName, options);
}

export default oneToNone;
