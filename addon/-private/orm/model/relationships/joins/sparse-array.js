import { ModelReferenceSymbol } from './sparse-model';

function SparseArray(ids, modelName, parent) {
  var arr = [];

  arr.push.apply(arr, ids);
  arr.__proto__ = SparseArray.prototype;

  arr._isSparse = true;
  arr[ModelReferenceSymbol] = {
    ids,
    modelName,
    parent
  };

  return arr;
}
SparseArray.prototype = new Array();

SparseArray.prototype.fetch = function fetch() {
  let { modelName, parent } = this[ModelReferenceSymbol];

  return parent.store.adapterFor(modelName)
    .findHasMany(modelName, parent, this);
};

export default SparseArray;
