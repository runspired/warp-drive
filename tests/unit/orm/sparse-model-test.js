import { SparseModel, ModelReferenceSymbol } from 'warp-drive/-private/orm/model/relationships/joins/sparse-model';
import { module, test } from 'qunit';

module('Unit | orm | sparse-model', {
  beforeEach() {}
});

const SUCCESS = {};

let fakeStore = {
  adapterFor() {
    return {
      findBelongsTo(modelName, id, parent) {
        SUCCESS.modelName = modelName;
        SUCCESS.id = id;
        SUCCESS.parent = parent;

        return SUCCESS;
      }
    };
  }
};

test('basic behavior works', function(assert) {
  assert.ok(SparseModel);

  let model = new SparseModel(1, 'foo', fakeStore);

  assert.equal(model.id, 1);
  assert.equal(model[ModelReferenceSymbol].modelName, 'foo');
  assert.equal(model[ModelReferenceSymbol].store, fakeStore);

  let parent = {};
  let fetched = model.fetch(parent);

  assert.equal(fetched, SUCCESS);
  assert.equal(SUCCESS.id, 1);
  assert.equal(SUCCESS.modelName, 'foo');
  assert.equal(SUCCESS.parent, parent);
});
