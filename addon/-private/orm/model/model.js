import Ember from 'ember';

const {
  get: emberGet
  } = Ember;

function Model() {}

Model.prototype.get = function get(path) {
  return emberGet(this, path);
};

Model.prototype.save = function save() {
  let schema = this.__schema;

  throw new Error(`You attempted to save the Model for '${schema.modelName}:${this.id}',
      but this model is set to uneditable.`);
};

Model.prototype.del = function del() {
  let schema = this.__schema;

  throw new Error(`You attempted to delete the Model for '${schema.modelName}:${this.id}',
      but this model is set to uneditable.`);
};

Model.prototype.set = function set(key, value) {
  let schema = this.__schema;

  throw new Error(`You attempted to set '${key}' on the Model for '${schema.modelName}:${this.id}',
    to ${value} but this model is immutable.`);
};

Model.prototype.unknownProperty = function unknownProperty(key) {
  let schema = this.__schema;

  // make this work better with glimmer `if`
  if (key === 'length' || key === 'isTruthy') {
    return undefined;
  }

  throw new Error(`You attempted to access '${key}' on the Model for '${schema.modelName}:id#${this.id}',
    but that key is undefined.  `);
};

Model.prototype.setUnknownProperty = function setUnknownProperty(key) {
  let schema = this.__schema;

  throw new Error(`You attempted to set '${key}' on the Model for '${schema.modelName}:${this.id}',
      but that key is undefined.`);
};

Model.prototype._isSparse = false;
Model.prototype.__isEditable = false;

export default Model;
