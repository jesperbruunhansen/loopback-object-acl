# loopback-object-acl
Loopback provides great "class-level" ACL's for restricting access to a whole Model or its mehods, but greatly lacks the ability to restric access to individual objects. This project tries to solve this, by setting object-level ACL's on each object, and manipulates Loopback's Query to only return objects the requesting user has access to.

## Examples

### User Read-level permissions
Lets say we want a Book-object only to be readable (pun intended) by 3 users (id: "aaa", id: "bbb" and id: "ccc"):

POST /api/books
```js
{
   "title": "Clean Code",
   "subtitle": "A Handbook of Agile Software Craftsmanship",
   "$acl":{
     "r_perm": {
       "users":["aaa", "bbb", "ccc"]
     }
   }
}
```

The mixin will parse the object to be stored as in Mongo:

```js
{
   id: ObjectId("123"),
   title: "Clean Code",
   subtitle: "A Handbook of Agile Software Craftsmanship",
   r: {
     u: ["aaa", "bbb", "ccc"]
     g: []
   },
   w: {
     u: [],
     g: []
   }
}
```
This object can now only be accessed by a user with an id of "aaa", "bbb" or "ccc" and no one else. When retrieving, the mixin will parse the object's ACL right back again:

GET /api/books/123
```js
{
   "id": "123"
   "title": "Clean Code",
   "subtitle": "A Handbook of Agile Software Craftsmanship",
   "$acl":{
     "r_perm": {
       "users":["aaa", "bbb", "ccc"]
     }
   }
}
```

### Group Read-level permissions
To specifiy every user that will have access to the object can be cumbersome and timeconsuming. This is where groups come in handy.

POST /api/books
```js
{
   "title": "Clean Code",
   "subtitle": "A Handbook of Agile Software Craftsmanship",
   "$acl":{
     "r_perm": {
       "groups":["group-id-1"]
     }
   }
}
```

As you've might guessed, this object is now accessible by users who has `group-id-1` specified in `acl_groups` on the User object.

### Combining Group and Read-level permissions
If `user-id-1` and `user-id-2` is not in `group-id-1` then these users can have explicit access this way:

POST /api/books
```js
{
   "title": "Clean Code",
   "subtitle": "A Handbook of Agile Software Craftsmanship",
   "$acl":{
     "r_perm": {
       "groups":["group-id-1"],
       "users":["user-id-1", "user-id-2"]
     }
   }
}
```

### Public objects
If you have installed the mixin on your model but you dont specify `$acl` on creation of a new object, the objects visibility will be public, ex: 

POST /api/books
```js
{
   "title": "Clean Code",
   "subtitle": "A Handbook of Agile Software Craftsmanship"
}
```

returns

```js
{
   "title": "Clean Code",
   "subtitle": "A Handbook of Agile Software Craftsmanship",
   "$acl":{
     "r_perm": {
       "groups":["*"],
       "users":["*"]
     },
     "w_perm": {
       "groups":["*"],
       "users":["*"]
     }
   }
}
```


## Install

```
npm install --save loopback-object-acl
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

Set `ObjectAclController` on what ever model you would like to protect with Object-level ACL:

```js
book.json

{
  "name": "Book",
  "base": "PersistedModel",
  "idInjection": true,
  "options": {
    "validateUpsert": true
  },
  "mixins": {
    "ObjectAclController": {}
  }
  ...
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
- [x] Set ACL on object-creation
- [ ] Set permissions on user creation


### Tests
- [x] ObjectAcl.js
- [x] CurrentUserUtil.js

## License
```
MIT License

Copyright (c) 2017 Jesper Bruun Hansen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
