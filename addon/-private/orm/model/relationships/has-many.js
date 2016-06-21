import Relationship from './-relationship';
import { singularize } from 'ember-inflector';
import SparseArray from './joins/sparse-array';
import { measure } from '../../instrument';

export class HasMany extends Relationship {

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
    this.relatedModelName = this.relatedModelName || singularize(this.prop);
    this.inverse = this.inverse || this.relatedModelName;
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
  fulfill(record, indicators) {
    let { recordStore, relatedModelName, options } = this;
    let references = new SparseArray(indicators.length);
    let hasUnfetchedRecords = false;

    for (let i = 0; i < indicators.length; i++) {
      let id = indicators[i].id;

      // measure('lookupReference-many');
      let reference = recordStore.lookupReference(relatedModelName, id);
      // measure('lookupReference-many');

      if (reference._isSparse) {
        hasUnfetchedRecords = true;
        reference._link(this, record);
      }

      references[i] = reference;
    }

    /*
    if (hasUnfetchedRecords && options.autofetch) {
      // references.fetch();
    }
    */

    return references;
  }

}

export function hasMany(modelName, options = {}) {
  return new HasMany(modelName, options);
}

export default hasMany;

