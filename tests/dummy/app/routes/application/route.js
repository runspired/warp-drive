import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    let store = this.get('store');
    let limit = 2500;

    return store.query('bar', { limit, page: 0 })
      .then(() => { return store.query('bar', { limit, page: 1 }); })
      .then(() => { return store.query('bar', { limit, page: 2 }); })
      .then(() => { return store.query('bar', { limit, page: 3 }); })
      .then(() => { return store.query('bar', { limit, page: 4 }); })
      .then(() => { return store.query('bar', { limit, page: 5 }); })
      .then(() => { return store.query('bar', { limit, page: 6 }); })
      .then(() => { return store.query('bar', { limit, page: 7 }); })
      .then(() => { return store.query('bar', { limit, page: 8 }); })
      .then(() => { return store.query('bar', { limit, page: 9 }); });
  }
});
