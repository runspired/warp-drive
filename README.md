# Warp Drive [WIP]

A lightweight, blazing fast, extensible, and powerful Request Layer and Data Store

## First Principles

This data store is being constructed along the following "first principles"

- It must have a small footprint.
- It must be blazing fast, even on Android.
- It must be able to work in any environment (Browser, ServiceWorker, WebWorker, Node).
- It should encourage explicitly defined behaviors and interactions.
- Data should be immutable unless clear change or alteration signals are given.
- You shouldn't have a separate ORM and request layer for your Mock.
- It must handle sparse data like a champ.

The internals of this project are pure JS, mostly ES6 classes, not Ember
Objects.  This is done so that this ORM can run client or server side,
with or without Ember.  This will make it easy to have a mock API running
via the http-mock setup or via pretender / web-worker / service-worker.

The exposed `Ember` primitives are thin service wrappers around a "pure JS"
core, and will be separated into their own addon consuming Warp-Drive when
this is ready to ship.

## Models

Your model definitions can be either POJOs or extensions of the provided `Model`.
The only benefit of the latter is that it is based on `Ember.Object` and
therefore capable of using `computed` properties.  The former will perform
far better.

### Attrs

Only properties defined with `attr` or via a `relationship` (see below)
are considered part of the model's schema.  You can define other properties,
but they will not be persisted with the model.

```js
import { attr } from 'warp-drive/model';

export default {
  foo: attr()
}
```

`attr(<type>, <options>)` takes optional first and second arguments.
`type` defaults to `string` and is used to determine what `transform` to
utilize when normalizing / serializing a value. `options` is currently
only used for `defaultValue` which may be a value or a function that will
be called to get the default value.  `options` is available to you during
normalization and serialization of an `attr`, and may be useful for storing
other meta about a property for such purposes.

### Relationships

Warp Drive relies on a more verbose pattern of defining relationships in
order to be able to best determine what kind of link to create between
the involved records.

All relationships take two optional parameters: `<relatedModelName>` and
`<options>`.  `options` can be used to specify the specific `inverse` key,
`autofetch` parameter, as well as a `defaultValue` (just like `attr`).

**Usage**

```js
import { oneToOne } from 'warp-drive/model';

export default {
  foo: oneToOne('foo', { inverse: 'bar' })
}
```

**Available Relationships**

- `oneToOne`    used for either end when both sides of a 1:1 relationship define the relationship
- `oneToNone`   used when a record has one of another but only it defines the relationship
- `belongsTo`   used when a record is one of many belonging to another record and both sides define the relationship
- `hasMany`   used when a record has many of another record and both sides define the relationship
- `manyToNone`  used when a record has many of another but only it defines the relationship
- `manyToMany`  used for either end when both sides of a many:many relationship define the relationship

**inverse**

If `options.inverse` is not defined, warp-drive attempts to build the inverse
based on the type of relationship specified, the `property` it was attached with
 and the `relatedModelName`.

**autofetch & Sync/Async Relationships**

Because of the use of `sparse` records and `sparse` arrays, you can choose
to load your data synchronously or asynchronously and the ORM will not care.

If you want the ORM to "autofetch" a relationship when a property on the
sparse array (other than the id or length) is accessed), set `autofetch: true`.

Autofetch is `false` by default.  When autofetch is false, you must manually
call `fetch` on the relationship to load it.

### Editing Models

Models are immutable (uneditable) by default, to make a model editable
you must flag it as editable.
