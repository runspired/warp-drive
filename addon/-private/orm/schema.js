import { Attr } from './model/attr';
import { BelongsTo } from './model/belongs-to';
import { HasMany } from './model/has-many';
import { singularize } from 'ember-inflector';
import Model from './model';
import EditableModel from './editable-model';

export const EDITABLE = Symbol('-editable-model-type');

export class Schema {

  constructor(shape, options) {
    this.attributes = null;
    this.relationships = null;
    this.shape = null;
    this.createFromShape = false;
    this.options = options;

    // injected at initialization
    this.orm = null;

    this._create(shape);
  }

  static create(shape, options) {
    return new Schema(shape, options);
  }

  _create(shape, options) {
    let keys = Object.keys(shape);
    let attributes = {};
    let relationships = {};

    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let value = shape[key];

      if (value instanceof Attr) {
        attributes[key] = value;
      } else if (value instanceof BelongsTo) {
        relationships[key] = value;
        value.prop = key;
        value.modelName = value.modelName || key;
        shape[key] = undefined;
      } else if (value instanceof HasMany) {
        relationships[key] = value;
        value.prop = key;
        value.modelName = value.modelName || singularize(key);
        shape[key] = undefined;
      }
    }

    this.attributes = attributes;
    this.relationships = relationships;
    this.shape = shape;

    this.createFromShape = typeof shape.create === 'function' && shape._isEmberOrmModel;

    if (!this.createFromShape) {
      this._artificialShape = Schema.createArtificialShape(options.editable ? EditableModel : Model, shape, options);
    }
  }

  static createArtificialShape(BaseClass, shape, options) {
    let keys = Object.keys(shape);
    let props = [];
    let attrs = [];

    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];

      if (typeof shape[key] === 'function') {
        props.push(key);
      } else {
        attrs.push(key);
      }
    }

    class ArtificialShape extends BaseClass {
      constructor(data = {}) {
        this[EDITABLE] = options.editable;

        for (let attr of attrs) {
          this[attr] = data[attr] || shape[attr];
        }
      }
    }

    for (let prop of props) {
      ArtificialShape.prototype[prop] = shape[prop];
    }

  }

  generateRecord(data) {
    if (this.createFromShape) {
      return this.shape.create(this._prepRecordData(data));
    } else {
      return new this._artificialShape(this._prepRecordData(data));
    }
  }

  _prepRecordData(data) {

  }

}

export default Schema;
