import Ember from 'ember';

const {
  Service,
  inject
  } = Ember;

export default Service.extend({

  __isEmberOrmStore: true,

  orm: inject.service('orm'),

  createRecord() {},

  deleteRecord() {},

  findAll() {},

  findRecord() {},

  query() {},

  queryRecord() {},

  pushPayload() {},

  adapterFor() {},

  serializerFor() {}

});
