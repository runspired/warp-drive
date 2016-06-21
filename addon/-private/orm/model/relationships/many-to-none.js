// foo has many bars
// bar has no foo

import Relationship from './-relationship';
import { singularize } from 'ember-inflector';

export class ManyToNone extends Relationship {

  recalc() {
    this.inverse = null;
    this.modelName = this.modelName || singularize(this.prop);
  }

  fulfill() { console.log('nothing to fulfill here'); }

}

export function manyToNone(modelName, options = {}) {
  return new ManyToNone(modelName, options);
}

export default manyToNone;
