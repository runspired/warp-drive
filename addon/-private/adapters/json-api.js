import URLBuilder from '../url-builder/json-api';
import Pipeline from './-pipeline';
import jQuery from 'jquery';
import Ember from 'ember';

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
  'willNormalize',
  'normalize', // "private"
  'didNormalize',
  'pushData', // "private"
  ['completed', 'pushFailed'],
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
    let isWrite = method === 'PUT' || method === 'POST';

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

      jQuery.ajax(req);
    }).then((raw) => {
      response.raw = raw;
    });
  }

  requestFailed() {}

  normalize() {}

  pushData() {}

  pushFailed() {}

  returnData() {}

}
