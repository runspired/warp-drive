export default class Relationship {

  constructor(modelName, options = {}) {
    this.options = options;
    this.prop = null;
    this.defaultValue = options.defaultValue;
    this.modelName = modelName;
    this.inverse = options.inverse || null;
  }

  fulfill() { throw new Error('Not Implemented'); }

  recalc() { throw new Error('Not Implemented'); }

}
