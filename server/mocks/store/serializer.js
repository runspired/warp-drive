function Serializer() {}

Serializer.prototype.serializeOne = function serializeOne(record) {
  return {
    data: {
      id: record.id,
      type: this._type,
      attributes: assign({}, record)
    }
  };
};

Serializer.prototype.normalizeOne = function normalizeOne(record) {
  var values = record.data && record.data.attributes ? record.data.attributes : {};

  delete values.id;

  return values;
};

Serializer.prototype.serializeMany = function serializeMany(records) {
  var _this = this;
  var data = records.map(function(record) {
    return _this.serializeOne(record).data;
  });

  return { data: data };
};

module.exports = Serializer;
