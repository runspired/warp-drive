import Ember from 'ember';

const {
  Service,
  inject
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

  findRecord() {},

  query() {},

  queryRecord() {},

  pushPayload() {},

  adapterFor() {},

  serializerFor() {}

});
