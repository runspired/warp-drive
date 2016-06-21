import Ember from 'ember';

const {
  Service,
  } = Ember;

export default Service.extend({

  __isEmberOrmStore: true,
  data: null,

  createRecord() {},

  deleteRecord() {},

  findAll(modelName, options) {
    let schema = this.data.schemaFor(modelName);

    return this.data.adapterFor(modelName)
      .pipe('findAll', schema, null, options);
  },

  findRecord(modelName, id, options) {
    let schema = this.data.schemaFor(modelName);

    return this.data.adapterFor(modelName)
      .pipe('findRecord', schema, id, options);
  },

  query(modelName, query, options) {
    let schema = this.data.schemaFor(modelName);

    return this.data.adapterFor(modelName)
      .pipe('query', schema, query, options);
  },

  queryRecord(modelName, query, options) {
    let schema = this.data.schemaFor(modelName);

    return this.data.adapterFor(modelName)
      .pipe('queryRecord', schema, query, options);
  },

  pushPayload() {},

  adapterFor(modelName) {
    return this.data.adapterFor(modelName);
  },

  serializerFor(modelName) {
    return this.data.serializerFor(modelName)
  }

});
