import { ModelReferenceSymbol } from './sparse-model';

class SparseArray extends Array {

  constructor(ids, modelName, parent) {
    super(...ids);

    this._isSparse = true;
    this[ModelReferenceSymbol] = {
      ids,
      modelName,
      parent
    };
  }

  fetch() {
    let { modelName, parent } = this[ModelReferenceSymbol];

    return parent.store.adapterFor(modelName)
      .findHasMany(modelName, parent, this);
  }

}

export default SparseArray;
