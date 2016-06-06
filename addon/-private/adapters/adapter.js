import URLBuilder from '../url-builder/json-api';
import RecordArray from '../orm/record-array';
import Pipeline from './-pipeline';
import syncline from './-syncline';
import jQuery from 'jquery';
import Ember from 'ember';
import { singularize } from 'ember-inflector';
import RSVP from 'rsvp';
import asap from './../ember-internals/asap';

RSVP.configure('async', function(callback, promise) {
  asap(function() { callback(promise); });
});

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

export default class Adapter {

  constructor(props = {}) {
    this.host = props.host || '';
    this.namespace = props.namespace || 'api';
    this.headers = props.headers || null;
    this.coalesceFindRequests = props.coalesceFindRequests || false;
    this.urlBuilder = props.urlBuilder || new URLBuilder(this.host, this.namespace);
  }

  // initiate request
  pipe(...args) {
    // return new Pipeline(this, PIPELINE_HOOKS).pipe(...args);
    return syncline(this, PIPELINE_HOOKS, args);
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
    let method = Adapter.methodForRequest(requestType);
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

    return new RSVP.Promise((resolve, reject) => {
      let req = assign(
                  {},
                  request.request,
                  { success: resolve, error: reject }
                );

      request.xhr = jQuery.ajax(req);
    }).then((raw) => {

      response.metrics = {
        recordsTotal: request.isMany ? raw.data.length : 1,
        includedTotal: raw.includes ? raw.includes.length : 0,
        start: performance.now(),
        end: null
      };


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

    // remove ability to do includes so we can benchmark with tons of requests
    // response.raw.includes = undefined;

    response.records = serializer[method](request.schema, response.raw);
  }

  pushData(request, response) {
    return this.recordStore.pushRecords(response.records);
  }

  pushFailed(request, response, error) {
    console.log(request, response, error);
    throw new Error('Error while attempting to push data into store');
  }

  returnData(request, response) {
    response.metrics.end = performance.now();
    let diff = response.metrics.end - response.metrics.start;
    let total = response.metrics.recordsTotal + response.metrics.includedTotal;

    console.log(`
      Loaded ${total} records
      (${response.metrics.includedTotal} includes) in ${diff}ms
      (${diff / total} ms/record)
      \t ${Math.round(total / diff)} records / ms
    `);

    let recordOrRecordArray = response.records.data;

    // recordOrRecordArray.meta = response.meta;
    return recordOrRecordArray;
  }

}

Adapter.prototype.recordStore = null;
