import URLBuilder from '../url-builder/json-api';
import RecordArray from '../orm/record-array';
import Pipeline from './-pipeline';
import jQuery from 'jquery';
import Ember from 'ember';
import { singularize } from 'ember-inflector';

const {
  assign
  } = Ember;

const PIPELINE_HOOKS = [
  'buildRequest',
  'initialize',
  'serialize',
  'willRequest',
  'request',
  ['didRequest', 'requestFailed'],
  'extractMeta',
  'willNormalize',
  'normalize', // "private"
  'didNormalize',
  'pushData', // "private"
  ['completed', 'pushFailed'],
  'cacheMeta',
  'returnData' // "private"
];

export default class JSONAPIAdapter {

  constructor(props = {}) {
    this.host = props.host || '';
    this.namespace = props.namespace || 'api';
    this.headers = props.headers || null;
    this.coalesceFindRequests = props.coalesceFindRequests || false;
    this.urlBuilder = props.urlBuilder || new URLBuilder(this.host, this.namespace);
  }

  // initiate request
  pipe(...args) {
    return new Pipeline(this, PIPELINE_HOOKS).pipe(...args);
  }

  static methodForRequest(type) {
    switch (type) {
      case 'createRecord':
        return 'POST';
      case 'updateRecord':
        return 'PUT';
      case 'deleteRecord':
        return 'DELETE';
      default:
        return 'GET';
    }
  }

  // request cycle
  buildRequest(requestType, schema, data, options = {}) {
    let url = options.url || (options.urlBuilder || this.urlBuilder).build(requestType, schema, data, options);
    let method = JSONAPIAdapter.methodForRequest(requestType);
    let isWrite = ['PUT', 'POST'].indexOf(method) !== -1;
    let isMany = ['query', 'findAll', 'findMany', 'findHasMany'].indexOf(requestType) !== -1;

    let req = {
      url,
      method,
      headers: this.headers
    };

    if (data && isWrite) {
      req.data = data;
    }

    return {
      type: requestType,
      schema,
      options,
      isWrite,
      isMany,
      request: req
    };
  }

  serialize(request) {
    if (request.isWrite) {
      let recordStore = this.recordStore;
      let serializer = recordStore.serializerFor(request.schema.modelName);

      request.request.data = serializer.serialize(request.schema, request.request.data);
    }
  }

  request(request, response) {
    return new Promise((resolve, reject) => {
      let req = assign(
                  {},
                  request.request,
                  { success: resolve, error: reject }
                );

      request.xhr = jQuery.ajax(req);
    }).then((raw) => {
      response.raw = raw;
    });
  }

  requestFailed(request, response, error) {
    console.log(request, response, error);
    throw new Error('Adapter Request Failed');
  }

  extractMeta(request, response) {
    response.meta = response.raw.meta;
    response.raw.meta = undefined;
  }

  normalize(request, response) {
    let serializer = this.recordStore.serializerFor(request.schema.modelName);
    let method = request.isMany ? 'normalizeMany' : 'normalizeOne';

    response.records = serializer[method](request.schema, response.raw);
  }

  _pushRecords(records) {
    let { recordStore } = this;

    for (let i = 0; i < records.length; i++) {
      let record = records[i];

      // swap for real record
      records[i] = recordStore.pushRecord(record);
    }
  }

  pushData(request, response) {
    let { recordStore } = this;

    if (request.isMany) {
      this._pushRecords(response.records.data);
    } else {
      response.records.data = recordStore.pushRecord(response.records.data);
    }

    // load related records
    if (response.records.included) {
      let included = response.records.included;

      this._pushRecords(included);
    }

  }

  pushFailed(request, response, error) {
    console.log(request, response, error);
    throw new Error('Error while attempting to push data into store');
  }

  returnData(request, response) {
    let recordOrRecordArray = response.records.data;

    // recordOrRecordArray.meta = response.meta;
    return recordOrRecordArray;
  }

}

JSONAPIAdapter.prototype.recordStore = null;
