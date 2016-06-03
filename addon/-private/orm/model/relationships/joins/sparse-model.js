const ModelReferenceSymbol = Symbol('related-model-info');

class SparseModel {

  constructor(id, modelName, store) {
    this.id = id;
    this._isSparse = true;

    const links = [];

    this[ModelReferenceSymbol] = {
      id,
      modelName,
      store,
      links
    };
  }

  _link(relationship, record) {
    let { links } = this[ModelReferenceSymbol];

    links.push({ relationship, record });
  }

  fetch(record) {
    let { id, modelName, store } = this[ModelReferenceSymbol];

    return store.adapterFor(modelName)
      .findBelongsTo(modelName, id, record);
  }

}

export {
  ModelReferenceSymbol,
  SparseModel
};

export default SparseModel;
