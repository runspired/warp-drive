import Schema from 'ember-orm/-private/orm/schema';
import { hasMany, HasMany } from 'ember-orm/-private/orm/model/has-many';
import { belongsTo } from 'ember-orm/-private/orm/model/belongs-to';

import { module, test } from 'qunit';

module('Unit | orm | schema', {
  beforeEach() {}
});

test('default behavior works', function(assert) {
  assert.ok(Schema);
  let a = {};
  let schema = Schema.create({ foo: a, bars: hasMany('bar'), balls: hasMany(), bat: belongsTo() });

  assert.ok(schema instanceof Schema);
  assert.ok(schema.relationships.bars instanceof HasMany);
  assert.equal(schema.relationships.bars.prop, 'bars');
  assert.equal(schema.relationships.bars.modelName, 'bar');
  assert.equal(schema.relationships.balls.modelName, 'ball');
  assert.equal(schema.relationships.bat.modelName, 'bat');
});
