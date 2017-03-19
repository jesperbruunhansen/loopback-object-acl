# loopback-object-acl

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

## Requirements

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
