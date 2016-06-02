export class HasMany {
  constructor(modelName, options) {
    this.modelName = modelName;
    this.options = options;
    this.prop = null;
    this.inverse = null;
  }
}

export function hasMany(modelName, options = {}) {
  return new HasMany(modelName, options);
}

export default hasMany;
