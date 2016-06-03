import { singularize, pluralize } from 'ember-inflector';

export default class URLBuilder {

  constructor(host, namespace) {
    this.host = host;
    this.namespace = namespace;
    this.maxURLLength = 2048;
  }

  build(requestType, schema, data, options) {
    switch (requestType) {
      case 'findRecord':
        return this.urlForFindRecord(schema, data, options);
      case 'findAll':
        return this.urlForFindAll(schema, data, options);
      case 'query':
        return this.urlForQuery(schema, data, options);
      case 'queryRecord':
        return this.urlForQueryRecord(schema, data, options);
      case 'findMany':
        return this.urlForFindMany(schema, data, options);
      case 'findHasMany':
        return this.urlForFindHasMany(schema, data, options);
      case 'findBelongsTo':
        return this.urlForFindBelongsTo(schema, data, options);
      case 'createRecord':
        return this.urlForCreateRecord(schema, data, options);
      case 'updateRecord':
        return this.urlForUpdateRecord(schema, data, options);
      case 'deleteRecord':
        return this.urlForDeleteRecord(schema, data, options);
      default:
        return this._buildURL(schema, data, options);
    }
  }

  _buildURL(schema, id /*, options*/) {
    let url = [];
    let { host } = this;
    let prefix = this.urlPrefix();
    let path = this.pathForModelName(schema.modelName);

    if (path) {
      url.push(path);
    }

    if (id) { url.push(encodeURIComponent(id)); }
    if (prefix) { url.unshift(prefix); }

    url = url.join('/');
    if (!host && url && url.charAt(0) !== '/') {
      url = '/' + url;
    }

    return url;
  }

  urlPrefix(path, parentURL) {
    let { host, namespace } = this;

    if (!host || host === '/') {
      host = '';
    }

    if (path) {
      // Protocol relative url
      if (/^\/\//.test(path) || /http(s)?:\/\//.test(path)) {
        // Do nothing, the full host is already included.
        return path;

      // Absolute path
      } else if (path.charAt(0) === '/') {
        return `${host}${path}`;

      // Relative path
      } else {
        return `${parentURL}/${path}`;
      }
    }

    // No path provided
    let url = [];

    if (host) {
      url.push(host);
    }

    if (namespace) {
      url.push(namespace);
    }

    return url.join('/');
  }

  pathForModelName(modelName) {
    return pluralize(modelName);
  }

  urlForFindRecord(schema, data /*, options*/) {
    return this._buildURL(schema, data);
  }

  urlForFindAll(schema, data /*, options*/) {
    return this._buildURL(schema);
  }

  _appendQuery(url, query) {
    let sortedKeys = Object.keys(query);
    let appender = url.indexOf('?') !== -1 ? '&' : '?';
    let params = [];
    let enc = encodeURIComponent;

    sortedKeys.sort();

    for (let i = 0; i < sortedKeys.length; i++) {
      let key = sortedKeys[i];
      let value = query[key];

      if (value instanceof Array) {
        throw new Error('Array values for query params are not Implemented yet, sorry :/');
      }

      params.push(`${enc(key)}=${enc(value)}`);
    }

    return `${url}${appender}${params.join('&')}`;
  }

  urlForQuery(schema, data /*, options*/) {
    let url = this._buildURL(schema);

    return this._appendQuery(url, data);
  }

  urlForQueryRecord(schema, data /*, options*/) {
    let url = this._buildURL(schema);

    return this._appendQuery(url, data);
  }

  urlForFindMany(schema, data /*, options*/) {
    let url = this._buildURL(schema);

    return this._appendQuery(url, { ids: data });
  }

  urlForFindHasMany(schema, data, options) {
    return this.urlForFindMany(schema, data, options);
  }

  urlForFindBelongsTo(schema, data /*, options*/) {
    return this._buildURL(schema, data);
  }

  urlForCreateRecord(schema /*, data, options*/) {
    return this._buildURL(schema);
  }

  urlForUpdateRecord(schema, data, options) {
    return this._buildURL(schema, data, options);
  }

  urlForDeleteRecord(schema, data, options) {
    return this._buildURL(schema, data, options);
  }

}
