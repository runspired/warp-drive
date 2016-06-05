var assign = require('object-assign');

function Serializer() {}

Serializer.prototype.serializeOne = function serializeOne(record, includes, addIncludes) {
  if (addIncludes !== false) {
    addIncludes = true;
  }

  var ret =  {};
  var seen = [];

  if (addIncludes) {
    if (!includes) {
      includes = ret.includes = [];
    }
  }

  ret.data = this._serializeRecord(record, includes, addIncludes, seen);

  return ret;
};

Serializer.prototype._serializeRecord = function(record, includes, addIncludes, seen) {
  if (seen.indexOf(record) !== -1) {
    throw new Error('Circular whoops!');
  }
  seen.push(record);
  var data = {
    id: record.id,
    type: record.type,
    attributes: assign({}, record.attributes)
  };

  // console.log('serializing record:', { id: record.id, type: record.type });

  if (record.relationships) {
    this.serializeIncludes(record, data, addIncludes ? includes : false, seen);
  }

  return data;
};

Serializer.prototype.serializeIncludes = function serializeIncludes(record, hash, includes, seen) {
  var keys = Object.keys(record.relationships);
  var _serializer = this;

  if (keys.length) {
    hash.relationships = {};
  }

  keys.forEach(function(key) {
    var rel = record.relationships[key];
    // console.log('serializing relationship', rel ? rel.info() : rel, key);
    if (rel) {
      rel.fetch();

      hash.relationships[key] = { data: rel.info() };
      // console.log('serialized ' + key, hash.relationships[key], hash.type + '#' + hash.id);

      if (includes) {
        if (rel instanceof Array) {
          // console.log('serializing many', rel.info(), rel.length, key);
          for (var i = 0; i < rel.length; i++) {
            if (seen.indexOf(rel[i]) === -1) {
              includes.push(_serializer._serializeRecord(rel[i], includes, false, seen));
            }
          }
        } else {
          if (seen.indexOf(rel.value) === -1) {
            includes.push(_serializer._serializeRecord(rel.value, includes, false, seen));
          }
        }
      }
    }
  });

};

Serializer.prototype.normalizeOne = function normalizeOne(record) {
  throw new Error('whoops, needs work');
  var values = record.data && record.data.attributes ? record.data.attributes : {};

  delete values.id;

  return values;
};

Serializer.prototype.serializeMany = function serializeMany(records) {
  var _this = this;
  var ret = {
    data: [],
    includes: []
  };

  records.forEach(function(record) {
    var serialized = _this.serializeOne(record);

    ret.data.push(serialized.data);
    ret.includes = ret.includes.concat(serialized.includes);
  });

  return ret;
};

module.exports = Serializer;
