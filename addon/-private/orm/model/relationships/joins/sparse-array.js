import { ModelReferenceSymbol } from './sparse-model';

function SparseArray(ids, modelName, parent) {
  let arr;
  if (typeof ids === 'number') {
    arr = new Array(ids);
  } else if (ids instanceof Array) {
    arr = ids.slice();
  } else {
    arr = [];
  }

  arr.__proto__ = SparseArray.prototype;

  arr[ModelReferenceSymbol] = {
    ids,
    modelName,
    parent
  };

  return arr;
}

SparseArray.prototype = new Array();
SparseArray.prototype._isSparse = true;

SparseArray.prototype.fetch = function fetch() {
  let { modelName, parent } = this[ModelReferenceSymbol];

  return parent.recordStore.adapterFor(modelName)
    .findHasMany(modelName, parent, this);
};

SparseArray.prototype.unknownProperty = function unknownProperty(key) {
  // debugger;
};

export default SparseArray;

window.SparseArray = SparseArray;
