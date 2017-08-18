const loopback = require("loopback");
const assert = require("assert");
const app = loopback;
const Promise = require("bluebird");
app.loopback = loopback;

const mixin = require("../ObjectAclController");
app.loopback.modelBuilder.mixins.define("ObjectAclController", mixin);

const dataSource = app.createDataSource({
  "host": "localhost",
  "port": 27017,
  "database": "acl-test",
  "username": "",
  "password": "",
  "name": "mongodb",
  "connector": "mongodb"
});

describe("MongoDB as DataSource", () => {

  let Book;
  let Member;
  let Group;

  before(() => {
    Book = dataSource.createModel("Book",
      {base: "PersistedModel"},
      {mixins: {ObjectAclController: true}}
    );

    Member = dataSource.createModel("Member",
      {base: "User"},
      {mixins: {ObjectAclController: true}}
    );

    Group = dataSource.createModel("Group");
  });

  afterEach(() => {
    return Promise.all([
      Book.destroyAll(null, {skipAcl: true}),
      Member.destroyAll(null, {skipAcl: true}),
      Group.destroyAll(null, {skipAcl: true})
    ]);
  });

  it("Should return only user-access level Books", () => {

    return Promise.all([
      Member.create({}),
      Member.create({}),
      Member.create({})
    ]).then(members => {
      return Promise.all([
        Book.create({_acl: {r_perm: {users: [members[0].id]}}, name: "Book nr. 1"}),
        Book.create({_acl: {r_perm: {users: [members[0].id, members[1].id]}}, name: "Book nr. 2"}),
        Book.create({_acl: {r_perm: {users: [members[0].id, members[1].id, members[2].id]}}, name: "Book nr. 3"}),
      ]).then(() => members);
    }).then(members => {
      return Promise.all([
        Book.find({}, {currentUser: members[0]}).then(books => {
          assert.equal(books.length, 3);
          assert.equal(books[0].name, "Book nr. 1");
          assert.equal(books[1].name, "Book nr. 2");
          assert.equal(books[2].name, "Book nr. 3");
        }),
        Book.find({}, {currentUser: members[1]}).then(books => {
          assert.equal(books.length, 2);
          assert.equal(books[0].name, "Book nr. 2");
          assert.equal(books[1].name, "Book nr. 3");
        }),
        Book.find({}, {currentUser: members[2]}).then(books => {
          assert.equal(books.length, 1);
          assert.equal(books[0].name, "Book nr. 3");
        })
      ]);

    });
  });

  it("Should return only group-access level Books", () => {

    return Promise.all([
      Group.create({}),
      Group.create({})
    ]).then(groups => {
      return Promise.all([
        Member.create({acl_groups: [groups[0].id]}),
        Member.create({acl_groups: [groups[0].id]}),
        Member.create({acl_groups: [groups[1].id]})
      ]).then(members => {
        return Promise.all([
          Book.create({_acl: {r_perm: {groups: [groups[0].id]}}, name: "Book nr. 1"}),
          Book.create({_acl: {r_perm: {groups: [groups[0].id]}}, name: "Book nr. 2"}),
          Book.create({_acl: {r_perm: {groups: [groups[1].id]}}, name: "Book nr. 3"}),
        ]).then(() => members);
      });
    }).then(members => {
      return Promise.all([
        Book.find({}, {currentUser: members[0]}).then(books => {
          assert.equal(books.length, 2);
          assert.equal(books[0].name, "Book nr. 1");
          assert.equal(books[1].name, "Book nr. 2");
        }),
        Book.find({}, {currentUser: members[1]}).then(books => {
          assert.equal(books.length, 2);
          assert.equal(books[0].name, "Book nr. 1");
          assert.equal(books[1].name, "Book nr. 2");
        }),
        Book.find({}, {currentUser: members[2]}).then(books => {
          assert.equal(books.length, 1);
          assert.equal(books[0].name, "Book nr. 3");
        })
      ]);
    });

  });

  it("Should return a mix of user and group level Books", () => {

    return Promise.all([
      Group.create({}),
      Group.create({})
    ]).then(groups => {
      return Promise.all([
        Member.create({acl_groups: [groups[0].id]}),
        Member.create({acl_groups: [groups[0].id]}),
        Member.create({acl_groups: [groups[1].id]})
      ]).then(members => {
        return Promise.all([
          Book.create({_acl: {r_perm: {groups: [groups[0].id], users: [members[2].id]}}, name: "Book nr. 1"}),
          Book.create({_acl: {r_perm: {groups: [groups[0].id]}}, name: "Book nr. 2"}),
          Book.create({_acl: {r_perm: {groups: [groups[1].id], users: [members[0].id]}}, name: "Book nr. 3"}),
        ]).then(() => members);
      });
    }).then(members => {
      return Promise.all([
        Book.find({}, {currentUser: members[0]}).then(books => {
          assert.equal(books.length, 3);
          assert.equal(books[0].name, "Book nr. 1");
          assert.equal(books[1].name, "Book nr. 2");
          assert.equal(books[2].name, "Book nr. 3");
        }),
        Book.find({}, {currentUser: members[1]}).then(books => {
          assert.equal(books.length, 2);
          assert.equal(books[0].name, "Book nr. 1");
          assert.equal(books[1].name, "Book nr. 2");
        }),
        Book.find({}, {currentUser: members[2]}).then(books => {
          assert.equal(books.length, 2);
          assert.equal(books[0].name, "Book nr. 1");
          assert.equal(books[1].name, "Book nr. 3");
        })
      ]);
    });

  });

});
