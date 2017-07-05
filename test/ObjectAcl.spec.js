const assert = require('assert');
const CurrentUserUtil = require("../lib/CurrentUserUtil");
const ObjectAcl = require("../lib/ObjectAcl");
const UserMock = require("./util/UserMock");
const path = require("path");
const SIMPLE_APP = path.join(__dirname, 'test-server');
const app = require(path.join(SIMPLE_APP, 'server/server.js'));

describe("Object Acl tests", () => {

  let objectAcl = null;

  beforeEach(() => {

    const userMock = new UserMock({
      id: "abc123",
      email: "test@test.com"
    });

    const currentUserUtil = new CurrentUserUtil({
      currentUser: userMock
    });

    objectAcl = new ObjectAcl({
      currentUser: currentUserUtil,
      query: {}
    });

  });

  describe("Pass options manually", () => {

    let user;

    before(() => {
      return app.models.Member.create({email: "foo@bar.dk", password: "1234"})
        .then(user_ => {
          user = user_;
          return Promise.all([
            app.models.Book.create({_acl: {r_perm: {users: [user_.id.toString()]}}}),
            app.models.Book.create({_acl: {r_perm: {users: ["xyz"]}}}),
            app.models.Book.create({_acl: {r_perm: {users: ["xyz"]}}}),
          ]);
        })
    });

    it("Should not return any books", () => {
      return app.models.Book.find().then(books => {
        assert.deepEqual(books.length, 0);
      });
    });

    it("Should return all books, by ignoring ACL", () => {
      return app.models.Book.find(null, {skipAcl:true}).then(books => {
        assert.equal(books.length, 3);
      });
    });

    it("Should only return Books that the user has access to", () => {
      return app.models.Book.find(null, {currentUser:user}).then(books => {
        assert.equal(books.length, 1);
      });
    });

  });

  describe("Where query", () => {

    it("Adds where and or-object when none is present", () => {

      objectAcl.setWhereQuery();
      assert.deepEqual(objectAcl.query.where.or, [])

    });

    it("Adds does not overwrite 'where' when present", () => {

      objectAcl._query = {where: {prop: "foo"}};
      objectAcl.setWhereQuery();
      assert.deepEqual(objectAcl.query.where.prop, "foo");
      assert.deepEqual(objectAcl.query.where.or, [])

    });

    it("Concatenates 'or' when present", () => {

      objectAcl._query = {where: {or: [1, 2, 3]}};
      objectAcl.setWhereQuery([4, 5, 6]);
      assert.deepEqual(objectAcl.query.where.or, [1, 2, 3, 4, 5, 6]);

    });

    it("Adds or to where-object when not present", () => {

      objectAcl._query = {where: {}};
      objectAcl.setWhereQuery();
      assert.deepEqual(objectAcl.query.where.or, {});

    });

  });

  describe("Get read groups/user queries", () => {

    beforeEach(() => {
      return objectAcl._currentUser.saveAclRelations(["aaa", "bbb", "ccc"]);
    });

    it("Returns read user query", () => {

      const q = objectAcl.getUserReadQuery();
      assert.deepEqual(q, {"r.u": {"inq": ["abc123", "*"]}});

    });

    it("Returns read groups query", () => {

      const q = objectAcl.getGroupsReadQuery();
      assert.deepEqual(q, {"r.g": {"inq": ["aaa", "bbb", "ccc", "*"]}});

    });

    it("Set the read query", () => {

      objectAcl.setReadQuery();
      assert.deepEqual(objectAcl.aclReadQuery, [
        {"r.u": {"inq": ["abc123", "*"]}},
        {"r.g": {"inq": ["aaa", "bbb", "ccc", "*"]}}
      ]);

    });

    it("Sets correct read query to query-object", () => {

      objectAcl.buildReadQuery();
      assert.deepEqual(objectAcl.query, {
        where: {
          or: [
            {"r.u": {"inq": ["abc123", "*"]}},
            {"r.g": {"inq": ["aaa", "bbb", "ccc", "*"]}}
          ]
        }
      });

    });

  });

});
