import Schema from 'warp-drive/-private/orm/schema';
import { manyToNone, ManyToNone } from 'warp-drive/-private/orm/model/relationships/many-to-none';
import { oneToNone } from 'warp-drive/-private/orm/model/relationships/one-to-none';

import { module, test } from 'qunit';

module('Unit | orm | schema', {
  beforeEach() {}
});

test('default behavior works', function(assert) {
  assert.ok(Schema);
  let a = {};
  let schema = new Schema({ foo: a, bars: manyToNone('bar'), balls: manyToNone(), bat: oneToNone() });

  assert.ok(schema instanceof Schema);
  assert.ok(schema.relationships.bars instanceof ManyToNone);
  assert.equal(schema.relationships.bars.prop, 'bars');
  assert.equal(schema.relationships.bars.modelName, 'bar');
  assert.equal(schema.relationships.balls.modelName, 'ball');
  assert.equal(schema.relationships.bat.modelName, 'bat');
});
