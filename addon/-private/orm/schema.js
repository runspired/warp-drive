import { Attr } from './model/relationships/attr';
import Model from './model/model';
import EditableModel from './model/editable-model';
import Relationship from './model/relationships/-relationship';
import Ember from 'ember';
import { ModelReferenceSymbol } from '../orm/model/relationships/joins/sparse-model';
import updater from './updater';
import { measure } from './instrument';
import EmptyObject from '../ember/empty-object';

const {
  get
  } = Ember;

function makeShape(schema, BaseClass, shape) {
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

  function ArtificialShape(data) {
    if (data) {
      this.id = data.id;
      for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i];

        this[attr] = data[attr] || shape[attr];
      }
    }

  }
  ArtificialShape.prototype = new BaseClass();
  ArtificialShape.prototype.__schema = schema;

  for (let i = 0; i < props.length; i++) {
    let prop = props[i];
    ArtificialShape.prototype[prop] = shape[prop];
  }

  return ArtificialShape;
}

export class Schema {

  constructor(shape, options = new EmptyObject()) {
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
    let attributes = new EmptyObject();
    let relationships = new EmptyObject();

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
      this._artificialShape = makeShape.call(null, this, (options.editable ? EditableModel : Model), shape);
    }
  }

  cloneRecord(record) {
    let modelData = new EmptyObject();

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

  generateRecord(doc) {

    let preppedData = new EmptyObject();

    if (doc.attributes) {
      for (let attrKey in this.attributes) {
        let attr = this.attributes[attrKey];

        preppedData[attrKey] = doc.attributes[attrKey] || getDefaultValue(attr);
      }
    }
    preppedData.id = doc.id;

    let record = this._generateRecord(preppedData);

    // ensures we don't populate relationships until after
    if (doc.relationships) {
      updater.schedule(this, this._populateRelationships, record, doc);
    }

    return record;
  }

  updateRecord(record, doc) {
    let trueRecord;
    measure('updateRecord');

    if (record._isSparse) {
      console.warn('splicing out sparse record');
      trueRecord = this.generateRecord(doc);

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
        record[attrKey] = doc.attributes[attrKey];
      }

      for (let relKey in this.relationships) {
        let info = doc.relationships[relKey];
        // debugger;
        record[relKey];
      }

    }

    measure('updateRecord');
    return trueRecord;
  }



  _populateRelationships(record, doc) {
    // measure('_populateRelationships');
    let keys = Object.keys(this.relationships);

    for (let i = 0; i < keys.length; i++) {
      let relKey = keys[i];
      let rel = this.relationships[relKey];

      if (doc.relationships[relKey]) {
        // measure('rel.fulfill');
        record[relKey] = rel.fulfill(record, doc.relationships[relKey].data);
        // measure('rel.fulfill');
      }
    }

    // measure('_populateRelationships');
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
