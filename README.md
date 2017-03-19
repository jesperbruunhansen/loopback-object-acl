# loopback-object-acl
Loopback provides great "class-level" ACL's for restricting access to a whole Model or its mehods, but greatly lacks the ability to restric access to individual objects. This project tries to solve this, by setting object-level ACL's on each object, and manipulates Loopback's Query to only return objects the requesting user has access to.

## Install

```
npm install loopback-object-acl
```

In `model-config.json` add `../node_modules/loopback-object-acl` to mixins

```js
  "_meta": {
    "sources": [
      "loopback/common/models",
      "loopback/server/models",
      "../common/models",
      "./models"
    ],
    "mixins": [
      "loopback/common/mixins",
      "loopback/server/mixins",
      "../common/mixins",
      "./mixins",
      "../node_modules/loopback-object-acl"
    ]
  }
```

### CurrentUser in context
This mixins expects a `currentUser` object on the `options` object. This is **not** default Loopback v3.x behavior, and must be implemented before usage.

Implementation can found here: http://loopback.io//doc/en/lb3/Using-current-context.html#use-a-custom-strong-remoting-phase

## Compatibility
This mixin is only tested with **Loopback v3.X** and using **MongoDB** as DataSource

## TODO

### Read-permissions
- [x] Do only return objects from database that the requesting user has access to.

### Write-permissions
Version 2.0

### Client
- [ ] Set ACL on object-creation
- [ ] Set permissions on user creation


### Tests
- [ ] ObjectAcl.js
- [ ] CurrentUserUtil.js
