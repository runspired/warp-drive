import { EDITABLE, Schema, updater } from './schema';
import SparseModel from './model/relationships/joins/sparse-model';
import { singularize } from 'ember-inflector';

export default class RecordStore {

  constructor(owner) {
    this.owner = owner;
    this.schemas = new Map();
    this.records = new Map();
    this.adapters = new Map();
    this.serializers = new Map();
  }

  _lookup(path) {
    return this.owner.lookup(path);
  }

  _lookupFactory(path) {
    return this.owner._lookupFactory(path);
  }

  lookupReference(modelName, id) {
    let realized;
    let store = this.records.get(modelName);

    if (!store) {
      this.schemaFor(modelName);
      store = this.records.get(modelName);
    }

    realized = store.get(id);

    // initialize a sparse-model to hold the place
    if (!realized) {
      realized = new SparseModel(id, modelName, this);
      store.set(id, realized);
    }

    return realized;
  }

  schemaFor(modelName) {
    let schema = this.schemas.get(modelName);

    if (!schema) {
      let shape = this._lookupFactory(`model:${modelName}`);

      schema = new Schema(shape, { modelName, editable: shape[EDITABLE] });

      this.schemas.set(modelName, schema);
      this.records.set(modelName, new Map());
    }

    return schema;
  }

  adapterFor(modelName) {
    let adapter = this.adapters.get(modelName);

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

      this.adapters.set(modelName, adapter);
    }

    return adapter;
  }

  serializerFor(modelName) {
    let serializer = this.serializers.get(modelName);

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

      this.serializers.set(modelName, serializer);
    }

    return serializer;
  }

  pushRecord(jsonApiReference) {
    // console.log('pushing reference', jsonApiReference);
    let modelName = singularize(jsonApiReference.type);
    let schema = this.schemaFor(modelName);
    let record = this.records.get(modelName).get(jsonApiReference.id);

    if (record) {
      schema.updateRecord(record, jsonApiReference);
    } else {
      record = schema.generateRecord(jsonApiReference);
      this.records.get(modelName).set(record.id, record);
    }

    // return updater.flush()
    //  .then(() => { return record; });
    return record;
  }

  pushRecords(records) {
    for (let i = 0; i < records.length; i++) {
      let record = records[i];

      // swap for real record
      records[i] = this.pushRecord(record);
    }

    // return updater.flush()
    //  .then(() => { return records; });
    return records;
  }


}
