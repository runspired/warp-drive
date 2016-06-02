import { Attr } from './model/relationships/attr';
import Model from './model/model';
import EditableModel from './model/editable-model';
import Relationship from './model/relationships/-relationship';
import Ember from 'ember';

import { EDITABLE } from './model/symbols';

const {
  get
  } = Ember;

export class Schema {

  constructor(shape, options = {}) {
    this.modelName = options.modelName;
    this.attributes = null;
    this.relationships = null;
    this.shape = null;
    this.createFromShape = false;
    this.editable = options.editable;

    // injected at initialization
    this.recordStore = null;

    this._create(shape, options);
  }

  _create(shape, options) {
    let keys = Object.keys(shape);
    let attributes = Object.create(null);
    let relationships = Object.create(null);

    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let value = shape[key];

      if (value instanceof Attr) {
        attributes[key] = value;
      } else if (value instanceof Relationship) {
        value.prop = key;
        value.primaryModelName = options.modelName;
        value.recalc();

        relationships[key] = value;
        shape[key] = undefined;
      }

    }

    this.attributes = attributes;
    this.relationships = relationships;
    this.shape = shape;

    this.createFromShape = typeof shape.create === 'function' && shape._isEmberOrmModel;

    if (!this.createFromShape) {
      this._artificialShape = this.createArtificialShape(options.editable ? EditableModel : Model, shape, options);
    }
  }

  createArtificialShape(BaseClass, shape, options) {
    let keys = Object.keys(shape);
    let props = [];
    let attrs = [];
    let schema = this;

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
        super(schema);
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

  cloneRecord(record) {
    let modelData = {};

    if (!this.createFromShape) {
      for (let attrKey in this.attributes) {
        modelData[attrKey] = record[attrKey];
      }

      for (let relKey in this.relationships) {
        modelData[relKey] = record[relKey];
      }
    } else {
      for (let attrKey in this.attributes) {
        modelData[attrKey] = get(record, attrKey);
      }

      for (let relKey in this.relationships) {
        modelData[relKey] = get(record, relKey);
      }
    }

    return this._generateRecord(modelData);
  }

  _generateRecord(data) {
    if (this.createFromShape) {
      return this.shape.create(data);
    } else {
      return new this._artificialShape(data);
    }
  }

  generateRecord(data) {
    this._generateRecord(this._prepRecordData(data));
  }

  _prepRecordData(data) {
    let modelData = {};

    for (let attrKey in this.attributes) {
      let attr = this.attributes[attrKey];

      modelData[attrKey] = data[attrKey] || getDefaultValue(attr);
    }

    for (let relKey in this.relationships) {
      let rel = this.relationships[relKey];

      modelData[relKey] = data[relKey] ? rel.fulfill(data[relKey]) : undefined;
    }
  }

}

function getDefaultValue(attr) {
  return attr.defaultValue ?
    (typeof attr.defaultValue === 'function' ? attr.defaultValue() : attr.defaultValue)
    : undefined;
}

export default Schema;
