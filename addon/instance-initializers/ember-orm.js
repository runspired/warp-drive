import Schema from 'ember-orm/-private/orm/schema';

export function initialize(instance) {

  // store
  const store = instance.lookup('service:store');
  const orm = instance.lookup('service:orm');

  // inject onto Schema
  Schema.orm = orm;

  // expose to all routes
  instance.inject('route', 'store', 'service:store');
  instance.inject('route', 'orm', 'service:orm');

  if (store && !store.__isEmberOrmStore) {
    throw new Error(
      'You installed ember-orm, but another `store` service is overriding it.' +
      '  You may need to uninstall ember-data: `npm uninstall --save-dev ember-data`'
    );
  }

}

export default {
  name: 'ember-orm',
  initialize
};
