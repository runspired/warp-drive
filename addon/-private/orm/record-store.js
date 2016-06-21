import { EDITABLE, Schema } from './schema';
import SparseModel from './model/relationships/joins/sparse-model';
import { singularize } from 'ember-inflector';
import HashMap from '../cache/hash-map';
import FastMap from '../cache/fast-map';
import EmptyObject from '../ember/empty-object';
import Ember from 'ember';
import updater from './updater';
import instrument from './instrument';
import { measure } from './instrument';

const CHROME_PREHEAT_NUMBER = 3;
const CHROME_PREHEAT_TIME = 0;
let nextYield;

function newYield() {
  return new Promise((resolve) => {
    setTimeout(resolve, CHROME_PREHEAT_TIME);
  }).then(() => { nextYield = undefined; })
}

function yieldThen(cb) {
  nextYield = nextYield || newYield();

  return nextYield
    .then(cb);
}

export default class RecordStore {

  constructor(owner) {
    this.owner = owner;
    this.schemas = new EmptyObject();
    this.records = new EmptyObject();
    this.adapters = new EmptyObject();
    this.serializers = new EmptyObject();
    this.meta = new EmptyObject();
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
      this.meta[modelName] = new EmptyObject();
      this.meta[modelName].recordsPushed = 0;
      this.meta[modelName].hasYielded = false;
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

  _pushRecord(doc) {
    let modelName = singularize(doc.type);
    let schema = this.schemaFor(modelName);
    let store = this.records[modelName];

    return this.__pushOneOfModel(doc,  store, schema);
  }

  __pushOneOfModel(doc, store, schema) {
    let record = store[doc.id];

    if (record) {
      return store[doc.id] = schema.updateRecord(record, doc);
    }

    record = schema.generateRecord(doc);
    store[record.id] = record;

    return record;
  }

  pushRecord(doc) {
    let maybeRecord = this._pushRecord(doc);

    if (typeof maybeRecord.then === 'function') {
      return maybeRecord
        .then((record) => {
          return updater.flush()
            .then(() => { return record; });
        });
    }

    return updater.flush()
      .then(() => { return maybeRecord; });
  }

  _pushMany(records) {
    if (records) {
      let types = new EmptyObject();
      let keys = [];

      for (let i = 0; i < records.length; i++) {
        let record = records[i];
        if (!types[record.type]) {
          types[record.type] = [];
          keys.push(record.type);
        }
        types[record.type].push(record);
      }

      let promises = new Array(keys.length);

      for (let i = 0; i < keys.length; i++) {
        promises[i] = this.__pushManyOfModel(types[keys[i]]);
      }

      return Promise.all(promises).then((results) => {
        let result = [];

        for (let i = 0; i < results.length; i++) {
          result = result.concat(results[i]);
        }

        return result;
      });
    }

    return Promise.resolve();
  }

  __pushManyOfModel(data) {
    let ref = data[0];

    if (!ref) {
      return Promise.resolve([]);
    }

    let modelName = singularize(ref.type);
    let schema = this.schemaFor(modelName);
    let store = this.records[modelName];
    let length = data.length;
    let result = new Array(length);
    let meta = this.meta[modelName];
    let pushed = meta.recordsPushed;
    let yielded = meta.hasYielded;
    let iter = 0;

    if (pushed < CHROME_PREHEAT_NUMBER) {
      for (iter; iter < CHROME_PREHEAT_NUMBER && iter < length; iter++) {
        meta.recordsPushed++;
        result[iter] = this.__pushOneOfModel(data[iter], store, schema);
      }
    } else if (yielded) {
      for (iter; iter < length; iter++) {
        result[iter] = this.__pushOneOfModel(data[iter], store, schema);
      }
    }

    // deal with any remaining records
    if (iter < length) {
      return yieldThen(() => {
        for (iter; iter < length; iter++) {
          result[iter] = this.__pushOneOfModel(data[iter], store, schema);
        }

        meta.hasYielded = true;
        return result;
      });

    } else {
      meta.hasYielded = true;
    }

    return Promise.resolve(result);
  }

  pushRecords(records, trustPrimaryType = true) {
    // instrument('pushRecords');
    // loading related records first is much faster :troll:
    // instrument('pushIncludes');
    let pushedIncludes = this._pushMany(records.includes)
      .then((records) => {
        // instrument('pushIncludes');
        return records;
      });

    // handle single record return
    if (!records.data instanceof Array) {
      records.data = this._pushRecord(records.data);

      return pushedIncludes
        .then(function() {
          // instrument('updaterFlush');
          return updater.flush();
        })
        .then(() => {
          // instrument('updaterFlush');
          // instrument('pushRecords');
          return records.data;
        });
    }

    // –––– handle multi record return

    // optimized loop for trusty responses
    if (trustPrimaryType) {
      // instrument('pushTrusted');
      return this.__pushManyOfModel(records.data)
        .then((records) => {
          // instrument('pushTrusted');
          records.data = records;

          return pushedIncludes
            .then(function() {
              // instrument('updaterFlush');
              return updater.flush();
            })
            .then(() => {
              // instrument('updaterFlush');
              // instrument('pushRecords');
              return records.data;
            });
        });

    // unoptimized loop for non-trusty responses
    } else {
      // instrument('pushUntrusted');
      return this._pushMany(records.data)
        .then((records) => {
          // instrument('pushUntrusted');
          records.data = records;

          return pushedIncludes
            .then(function() {
              // instrument('updaterFlush');
              return updater.flush();
            })
            .then(() => {
              // instrument('updaterFlush');
              // instrument('pushRecords');
              return records.data;
            });
        });
    }

  }


}
