const assert = require('assert');
const CurrentUserUtil = require("../lib/CurrentUserUtil");
const UserMock = require("./util/UserMock");


describe("CurrentUser Utility tests", () => {

  let currentUserUtil = null;

  beforeEach(() => {

    const userMock = new UserMock({
      id: "abc123",
      email: "test@test.com"
    });

    currentUserUtil = new CurrentUserUtil({
      currentUser: userMock
    });

  });

  describe("Get/set", () => {

    it("Returns id as array for query object", () => {
      assert.deepEqual(currentUserUtil.getIdForQuery(), ["abc123"])
    });

    it("Throws error if 'currentUser' is not set", () =>{
      currentUserUtil._currentUser = null;
      assert.throws(() => currentUserUtil.currentUser)
    });

    it("Throws error if 'app' is not set", () =>{
      currentUserUtil._app = null;
      assert.throws(() => currentUserUtil.app)
    });

  });


  describe("Persist acl_groups to User", () => {

    it("Adds given ids to'acl_groups' to currentUser", done => {

      currentUserUtil
        .saveAclRelations(["aaa", "bbb", "ccc"])
        .then(user => {

          assert.deepEqual(user.acl_groups, ["aaa", "bbb", "ccc"]);
          done();

        }).catch(done);

    });

    it("is possible to get 'acl_groups' from getGroupAcls()", done => {

      currentUserUtil
        .saveAclRelations(["aaa", "bbb", "ccc"])
        .then(() => {

          assert.deepEqual(currentUserUtil.getGroupAcls(), ["aaa", "bbb", "ccc"]);
          done();

        }).catch(done);

    })

  });


});



