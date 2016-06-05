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

  unknownProperty(key) {
    let { modelName, id } = this[ModelReferenceSymbol];

    // make this work better with glimmer `if`
    if (key === 'length' || key === 'isTruthy') {
      return undefined;
    }

    // if the Model itself has this key
    throw new Error(`You attempted to access '${key}' on a SparseModel for '${modelName}:id#${id}',
      but that autofetch is set to 'false'.  You must explicitly call fetch on this relationship.`);

    // else
    // throw new Error(`You attempted to access '${key}' on a SparseModel for '${modelName}:id#${id}',
    //   but that key does not exist on the full model.`);
  }

}

export {
  ModelReferenceSymbol,
  SparseModel
};

export default SparseModel;
