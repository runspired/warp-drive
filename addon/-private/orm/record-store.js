import { EDITABLE, Schema, updater } from './schema';
import SparseModel from './model/relationships/joins/sparse-model';
import { singularize } from 'ember-inflector';
import EmptyObject from '../ember-internals/empty-object';

export default class RecordStore {

  constructor(owner) {
    this.owner = owner;
    this.schemas = new EmptyObject();
    this.records = new EmptyObject();
    this.adapters = new EmptyObject();
    this.serializers = new EmptyObject();

    window.recordStore = this;
  }

  _lookup(path) {
    return this.owner.lookup(path);
  }

  _lookupFactory(path) {
    return this.owner._lookupFactory(path);
  }

  lookupReference(modelName, id) {
    let realized;
    let store = this.records[modelName];

    if (!store) {
      this.schemaFor(modelName);
      store = this.records[modelName];
    }

    realized = store[id];

    // initialize a sparse-model to hold the place
    if (!realized) {
      realized = new SparseModel(id, modelName, this);
      store[id] = realized;
    }

    return realized;
  }

  schemaFor(modelName) {
    let schema = this.schemas[modelName];

    if (!schema) {
      let shape = this._lookupFactory(`model:${modelName}`);

      schema = new Schema(shape, { modelName, editable: shape[EDITABLE] });

      this.schemas[modelName] = schema;
      this.records[modelName] = new EmptyObject();
    }

    return schema;
  }

  adapterFor(modelName) {
    let adapter = this.adapters[modelName];

    if (!adapter) {
      let Adapter = this._lookupFactory(`adapter:${modelName}`);

      if (!Adapter) {
        if (modelName === 'application') {
          throw new Error('You must define an application adapter!');
        }
        return this.adapterFor('application');
      }

      adapter = new Adapter();
      adapter.recordStore = this;

      this.adapters[modelName] = adapter;
    }

    return adapter;
  }

  serializerFor(modelName) {
    let serializer = this.serializers[modelName];

    if (!serializer) {
      let Serializer = this._lookupFactory(`serializer:${modelName}`);

      if (!Serializer) {
        if (modelName === 'application') {
          throw new Error('You must define an application serializer!');
        }
        return this.serializerFor('application');
      }

      serializer = new Serializer();
      serializer.recordStore = this;

      this.serializers[modelName] = serializer;
    }

    return serializer;
  }

  _pushRecord(jsonApiReference, flushRelationships = false) {
    let modelName = singularize(jsonApiReference.type);
    let schema = this.schemaFor(modelName);
    let record = this.records[modelName][jsonApiReference.id];

    if (record) {
      if (record._isSparse) {
        record = this.records[modelName][jsonApiReference.id] = schema.updateRecord(record, jsonApiReference, flushRelationships);
      } else {
        schema.updateRecord(record, jsonApiReference, flushRelationships);
      }

    } else {
      record = schema.generateRecord(jsonApiReference, flushRelationships);
      this.records[modelName][record.id] = record;
    }

    return record;
  }

  pushRecord(jsonApiReference) {
    let record = this._pushRecord(jsonApiReference);

    return updater.flush()
      .then(() => { return record; });
  }

  pushRecords(records) {

    // loading related records first is much faster :troll:
    if (records.includes) {
      for (let i = 0; i < records.includes.length; i++) {
        this._pushRecord(records.includes[i], false);
      }
    }

    if (records.data instanceof Array) {
      for (let i = 0; i < records.data.length; i++) {
        // swap for real record
        records.data[i] = this._pushRecord(records.data[i], true);
      }
    } else {
      records.data = this._pushRecord(records.data, true);
    }

    return updater.flush()
      .then(() => { return records.data; });
  }


}
