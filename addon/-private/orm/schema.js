import { Attr } from './model/relationships/attr';
import Model from './model/model';
import EditableModel from './model/editable-model';
import Relationship from './model/relationships/-relationship';
import Ember from 'ember';
import { ModelReferenceSymbol } from '../orm/model/relationships/joins/sparse-model';

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
        value.setup();

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

        for (let i = 0; i < attrs.length; i++) {
          let attr = attrs[i];

          this[attr] = data[attr] || shape[attr];
        }
      }
    }

    for (let i = 0; i < props.length; i++) {
      let prop = props[i];
      ArtificialShape.prototype[prop] = shape[prop];
    }

    return ArtificialShape;
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

  generateRecord(jsonApiReference) {
    let preppedData = this._prepRecordData(jsonApiReference);
    preppedData.id = jsonApiReference.id;

    let record = this._generateRecord(preppedData);

    this._populateRelationships(record, jsonApiReference);
    return record;
  }

  updateRecord(record, jsonApiReference) {
    let trueRecord;

    if (record._isSparse) {
      trueRecord = this.generateRecord(jsonApiReference);

      // swap references
      let links = record[ModelReferenceSymbol].links;
      for (let i = 0; i < links.length; i++) {
        let { relationship, record: parent } = links[i];

        if (parent[relationship.prop] instanceof Array) {
          let index = parent[relationship.prop].indexOf(record);

          if (index !== -1) {
            parent[relationship.prop].splice(index, 1, trueRecord);
          }

        } else {
          parent[relationship.prop] = trueRecord;
        }
      }

    } else {
      // treat this new data as the true source of truth
      trueRecord = record;

      for (let attrKey in this.attributes) {
        record[attrKey] = jsonApiReference.attributes[attrKey];
      }

      for (let relKey in this.relationships) {
        // record[relKey] = jsonApiReference.relationships[relKey];
      }

    }

    return trueRecord;
  }

  _populateRelationships(record, jsonApiReference) {
    if (jsonApiReference.relationships) {
      for (let relKey in this.relationships) {
        let rel = this.relationships[relKey];

        record[relKey] = jsonApiReference.relationships[relKey] ? rel.fulfill(record, jsonApiReference.relationships[relKey].data) : undefined;
      }
    }
  }

  _prepRecordData(jsonApiReference) {
    let modelData = {};

    if (jsonApiReference.attributes) {
      for (let attrKey in this.attributes) {
        let attr = this.attributes[attrKey];

        modelData[attrKey] = jsonApiReference.attributes[attrKey] || getDefaultValue(attr);
      }
    }

    return modelData;
  }

}

// injected at boot time
Schema.prototype.recordStore = null;

function getDefaultValue(attr) {
  return attr.defaultValue ?
    (typeof attr.defaultValue === 'function' ? attr.defaultValue() : attr.defaultValue)
    : undefined;
}

export default Schema;
