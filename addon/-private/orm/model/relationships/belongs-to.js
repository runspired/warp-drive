// foo has many bars
// bar has a foo

import Relationship from './-relationship';
import { pluralize } from 'ember-inflector';
import { measure } from '../../instrument';

export class BelongsTo extends Relationship {

  /*
  constructor(modelName, options = {}) {
    this.options = options;
    this.prop = null;
    this.defaultValue = options.defaultValue;
    this.relatedModelName = modelName;
    this.primaryModelName = null;
    this.inverse = options.inverse || null;
  }
  */

  /*
   @method setup

   Called by `Schema` after setting `prop` and `primaryModelName`
   to give the relationship a chance to autofill any information
   that is still missing.
   */
  setup() {
    this.relatedModelName = this.relatedModelName || this.prop;
    this.inverse = this.inverse || pluralize(this.relatedModelName);
  }

  /*
   @method fulfill
   @prop record
   @prop data

   Called by `Schema` when generating a new model instance
   with the data provided for the relationship.  This method
   should return either a `sparse-reference` (model or array)
   or a fulfilled model / record array.
   */
  fulfill(record, indicator) {
    // measure('lookupReference-belongsTo');
    let reference = this.recordStore.lookupReference(this.relatedModelName, indicator.id);
    // measure('lookupReference-belongsTo');

    if (reference._isSparse) {
      reference._link(this, record);

      /*
      if (this.options.autofetch) {
      //  reference.fetch();
      }
      */
    }

    return reference;
  }

}

export function belongsTo(modelName, options = {}) {
  return new BelongsTo(modelName, options);
}

export default belongsTo;
