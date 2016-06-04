function pluralize(str) {
  return str + 's';
}

function Namespace(name, factory, serializer) {
  this._recordMap = {};
  this._records = [];
  this._nextID = 0;
  this._schema = factory;
  this._name = name;
  this._type = pluralize(name);
}

Namespace.prototype.clone = function clone(records) {
  return records.map(function(record) {
    return assign({}, record);
  });
};

Namespace.prototype.findRecord = function findRecord(id) {
  var record = this._recordMap[id];

  if (!record || record.__deleted) {
    throw new Error(404);
  }

  return this.serializer.serializeOne(record);
};

Namespace.prototype.createRecord = function createRecord(data) {
  var record = {};

  if (!data) {
    throw new Error(500);
  }

  var values = this.normalizeOne(data);

  assign(record, this._schema(), values, { id: this._nextID++ });
  this._records.push(record);
  this._recordMap[record.id] = record;

  return this.serializer.serializeOne(record);
};

Namespace.prototype.findAll = function findAll() {
  return this.serializer.serializeMany(this._records.filter(function(record) {
    return !record.__deleted;
  }));
};

Namespace.prototype.deleteRecord = function deleteRecord(id) {
  var record = this._recordMap[id];

  if (!record || record.__deleted) {
    throw new Error(500);
  }

  record.__deleted = true;
};

Namespace.prototype.updateRecord = function updateRecord(id, data) {
  var record = this._recordMap[id];

  if (!data || !record || record.__deleted) {
    throw new Error(500);
  }

  var values = this.normalizeOne(data);

  assign(record, values);

  return this.serializer.serializeOne(record);
};

module.exports = Namespace;
