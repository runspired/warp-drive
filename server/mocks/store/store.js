/* jshint node:true */
var Serializer = require('./serializer');
var Namespace = require('./namespace');
var Attr = require('./attr');
var One = require('./one');
var Many = require('./many');

function Store(serializer) {
  this.data = {};
  this.serializer = serializer || new Serializer();

  // inject all the things
  Attr.prototype.store = this;
  One.prototype.store = this;
  Many.prototype.store = this;
  Namespace.prototype.store = this;
}

Store.prototype.registerNamespace = function registerNamespace(namespace, factory) {
  this.data[namespace] = new Namespace(namespace, factory, this.serializer);
};

Store.prototype.namespaceFor = function namespaceFor(namespace) {
  return this.data[namespace];
};

Store.prototype.findRecord = function findRecord(namespace, id) {
  var record = this.namespaceFor(namespace).findRecord(id);

  return this.serializer.serializeOne(namespace, record);
};

Store.prototype.createRecord = function createRecord(namespace, data) {
  return this.serializer.serializeOne(
    this.namespaceFor(namespace).createRecord(data)
  );
};

Store.prototype.findAll = function findAll(namespace) {
  return this.serializer.serializeMany(
    this.namespaceFor(namespace).findAll()
  );
};

Store.prototype.deleteRecord = function deleteRecord(namespace, id) {
  this.namespaceFor(namespace).deleteRecord(id);
};

Store.prototype.updateRecord = function updateRecord(namespace, id, data) {
  return this.serializer.serializeOne(
    this.namespaceFor(namespace).updateRecord(id, data)
  );
};

module.exports = Store;
