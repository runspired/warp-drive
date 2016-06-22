import Schema from 'warp-drive/-private/orm/schema';
import RecordStore from 'warp-drive/-private/orm/record-store';
import Relationship from 'warp-drive/-private/orm/model/relationships/-relationship';
import Ember from 'ember';

const {
  getOwner
  } = Ember;

export function initialize(instance) {

  // store
  const store = instance.lookup('service:store');
  const owner = getOwner(store);
  const recordStore = new RecordStore(owner);

  // inject the recordStore
  store.data = recordStore;
  Schema.prototype.recordStore = recordStore;
  Relationship.prototype.recordStore = recordStore;

  // expose to all routes
  instance.inject('route', 'store', 'service:store');

  if (store && !store.__isWarpDriveStore) {
    throw new Error(
      'You installed warp-drive, but another `store` service is overriding it.' +
      '  You may need to uninstall ember-data: `npm uninstall --save-dev ember-data`'
    );
  }

}

export default {
  name: 'warp-drive',
  initialize
};
