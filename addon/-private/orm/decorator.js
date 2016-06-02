import Ember from 'ember';

const {
  get
  } = Ember;

class Decorator {

  constructor(store, orm, factory) {
    this.store = store;
    this.orm = orm;
    this.factory = factory;
    this.data =  null;
    this._editable = null;
    this.schema = null;
  }

  __copy() {
    let copy = {};
    let attrs = Object.keys(this.schema.attributes);
    let rels = Object.keys(this.schema.relationships);

    for (let i = 0; i < attrs.length; i++) {
      let attr = attrs[i];

      copy[attr] = get(this.data, attr);
    }

    // pass through references for relationships
    for (let i = 0; i < rels.length; i++) {
      let rel = get(this.data, rels[i]);
      // let relType = this.schema.relationships[rel];

      copy[rel] = get(this.data, rel);
    }

    return copy;
  }

  checkout() {
    if (!this._editable) {
      this._editable = this.factory.create(this.toJSON());
    }

    return this._editable;
  }

  save() {}

  del() {}

  unknownProperty(key) {
    throw new Error(`You attempted to access '${key}' on the ModelController for '${this.modelName}:${this.id}',
      but that key is undefined.  `);
  }

  setUnknownProperty(key) {
    throw new Error(`You attempted to access '${key}' on the ModelController for '${this.modelName}:${this.id}',
      but that key is undefined.  `);
  }

}

export default Decorator;
