export class BelongsTo {
  constructor(modelName, options) {
    this.modelName = modelName;
    this.options = options;
    this.prop = null;
    this.inverse = null;
  }
}

export function belongsTo(modelName, options = {}) {
  return new BelongsTo(modelName, options);
}

export default belongsTo;
