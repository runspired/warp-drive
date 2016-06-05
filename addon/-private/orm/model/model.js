import { EDITABLE, SCHEMA, ORM_REF } from './symbols';
import Ember from 'ember';

const {
  get
  } = Ember;

let ORM_ID = 0;

export default class Model {

  constructor(schema) {
    this.id = ORM_ID++;
    this[ORM_REF] = this.id;
    this[SCHEMA] = schema;
    this[EDITABLE] = false;
  }

  get(path) {
    return get(this, path);
  }

  save() {
    let schema = this[SCHEMA];

    throw new Error(`You attempted to save the Model for '${schema.modelName}:${this.id}',
      but this model is set to uneditable.`);
  }

  del() {
    let schema = this[SCHEMA];

    throw new Error(`You attempted to delete the Model for '${schema.modelName}:${this.id}',
      but this model is set to uneditable.`);
  }

  set(key, value) {
    let schema = this[SCHEMA];

    throw new Error(`You attempted to set '${key}' on the Model for '${schema.modelName}:${this.id}',
      to ${value} but this model is immutable.`);
  }

  unknownProperty(key) {
    let schema = this[SCHEMA];

    // make this work better with glimmer `if`
    if (key === 'length' || key === 'isTruthy') {
      return undefined;
    }

    throw new Error(`You attempted to access '${key}' on the Model for '${schema.modelName}:id#${this.id}',
      but that key is undefined.  `);
  }

  setUnknownProperty(key) {
    let schema = this[SCHEMA];

    throw new Error(`You attempted to set '${key}' on the Model for '${schema.modelName}:${this.id}',
      but that key is undefined.`);
  }

}
