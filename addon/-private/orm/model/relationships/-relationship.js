export default class Relationship {

  constructor(modelName, options = {}) {
    this.options = options;
    this.prop = null;
    this.defaultValue = options.defaultValue;
    this.relatedModelName = modelName;
    this.primaryModelName = null;
    this.inverse = options.inverse || null;
  }

  /*
    @method setup

    Called by `Schema` after setting `prop` and `primaryModelName`
    to give the relationship a chance to autofill any information
    that is still missing.
   */
  setup() { throw new Error('Not Implemented'); }

  /*
    @method fulfill
    @prop data

    Called by `Schema` when generating a new model instance
    with the data provided for the relationship.  This method
    should return either a `sparse-reference` (model or array)
    or a fulfilled model / record array.
   */
  fulfill(/*record, data */) { throw new Error('Not Implemented'); }

}

// injected later
Relationship.prototype.recordStore = null;
