SoftDelete
=============

Edited version of [loopback-softdelete-mixin](https://github.com/gausie/loopback-softdelete-mixin)

#### changes

1.  change `isDeleted = {}` to `isDeleted = false`
2.  return deletedId when deleteById or destroyById is used

This module is designed for the [Strongloop Loopback](https://github.com/strongloop/loopback) framework. It allows entities of any Model to be "soft deleted" by adding `deletedAt` and `_isDeleted` attributes. Queries following the standard format will no return these entities; they can only be accessed by adding `{ deleted: true }` to the query object (at the same level as `where`, `include` etc).

It is heavily inspired by [loopback-ds-timestamp-mixin](https://github.com/clarkbw/loopback-ds-timestamp-mixin).

Install
-------

```bash
  npm install --save loopback-softdelete-2-mixin
```

Configure
----------

To use with your Models add the `mixins` attribute to the definition object of your model config.

```json
  {
    "name": "Widget",
    "properties": {
      "name": {
        "type": "string",
      },
    },
    "mixins": {
      "SoftDelete" : true,
    },
  },
```


Retrieving deleted entities
---------------------------

To run queries that include deleted items in the response, add `{ deleted: true }` to the query object (at the same level as `where`, `include` etc).
