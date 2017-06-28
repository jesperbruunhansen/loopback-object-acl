const loopback = require("loopback");
const assert = require("assert");
const app = loopback;
app.loopback = loopback;

const mixin = require("../ObjectAclController");
app.loopback.modelBuilder.mixins.define("ObjectAclController", mixin);

const dataSource = app.createDataSource({connector: app.Memory});

describe("ACL property names as mixin config", () => {

  it("Works with default value", () => {

    const Member = dataSource.createModel("Member", {
      id: {type: Number, generated: false, id: true},
      base: "User"
    });

    const Book = dataSource.createModel('Book',
      {id: {type: Number, generated: false, id: true}, name: String, type: String},
      {mixins: {ObjectAclController: true}}
    );

    const membersCreated = [
      Member.create({id:1, acl_groups: ["a"]}),
      Member.create({id:2, acl_groups: ["b"]})
    ];

    return Promise.all(membersCreated)
      .then(users => {
        return Book.create({id: 1, name: 'book 1', $acl: { r_perm: { groups: ["a"]}}})
          .then(book => Book.findById(book.id, null, {currentUser : users[0]}))
          .then(book => {
            assert.equal(book.id, 1);
            return Promise.resolve(book);
          })
          .then(book => Book.findById(book.id, null, {currentUser: users[1]}))
          .then(book => {
            assert.equal(book, null)
          });
      });

  });

  it("Works with custom value", () => {

    const Member = dataSource.createModel("Member1", {
      id: {type: Number, generated: false, id: true},
      base: "User"
    });

    const Book = dataSource.createModel('Book1',
      {id: {type: Number, generated: false, id: true}, name: String, type: String},
      {mixins: {ObjectAclController: {aclPropertyName:"foobar"}}}
    );

    const membersCreated = [
      Member.create({id:1, foobar: ["a"]}),
      Member.create({id:2, foobar: ["b"]})
    ];

    return Promise.all(membersCreated)
      .then(users => {
        return Book.create({id: 1, name: 'book 1', $acl: { r_perm: { groups: ["a"]}}})
          .then(book => Book.findById(book.id, null, {currentUser : users[0]}))
          .then(book => {
            assert.equal(book.id, 1);
            return Promise.resolve(book);
          })
          .then(book => Book.findById(book.id, null, {currentUser: users[1]}))
          .then(book => {
            assert.equal(book, null)
          });
      });

  });

});

