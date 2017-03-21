
const assert = require('assert');
const mockOperations = {observe: (name, func) => {}};
const objectAclController = require("../ObjectAclController")(mockOperations, {});

describe("ObjectAclController tests", () => {

  let createBookFix;

  before(() => {
    createBookFix = require("./fixtures/create-book-ctx.json");
  });

  describe("Before-save parsing", () => {

    it("Parses read and write, when $acl is present", () => {

      let bookFixture = createBookFix[0];

      objectAclController.beforeSave(bookFixture,test);

      function test(){

        assert.deepEqual(bookFixture.instance, {
          "name": "name",
          "subTitle": "a subtitle",
          "isbn": 1231,
          "r": {
            "u": ["aaa", "bbb"],
            "g": ["ccc", "ddd"]
          },
          "w": {
            "u": ["aaa", "bbb"],
            "g": ["ccc", "ddd"]
          }
        });

      }

    });

    it("Set public ACL when $acl is NOT present", () => {

      let bookFixture = createBookFix[1];

      objectAclController.beforeSave(bookFixture,test);

      function test(){

        assert.deepEqual(bookFixture.instance, {
          "name": "name",
          "subTitle": "a subtitle",
          "isbn": 1231,
          "r": {
            "u": ["*"],
            "g": ["*"]
          },
          "w": {
            "u": ["*"],
            "g": ["*"]
          }
        });

      }

    });

    it("Return error, when $acl is set, but no permission given", () => {

      let bookFixture = createBookFix[2];

      objectAclController.beforeSave(bookFixture,test);

      function test(error){

        assert.ok(error);

      }

    });

    it("Only assign Read ACLs to user, when nothing else is given", () => {

      let bookFixture = createBookFix[3];

      objectAclController.beforeSave(bookFixture,test);

      function test(){

        assert.deepEqual(bookFixture.instance, {
          "name": "name",
          "subTitle": "a subtitle",
          "isbn": 1231,
          "r": {
            "u": ["aaa", "bbb"],
            "g": []
          },
          "w": {
            "u": [],
            "g": []
          }
        });

      }

    });

    it("Only assign Read ACLs to groups, when nothing else is given", () => {

      let bookFixture = createBookFix[4];

      objectAclController.beforeSave(bookFixture,test);

      function test(){

        assert.deepEqual(bookFixture.instance, {
          "name": "name",
          "subTitle": "a subtitle",
          "isbn": 1231,
          "r": {
            "u": [],
            "g": ["aaa", "bbb"]
          },
          "w": {
            "u": [],
            "g": []
          }
        });

      }

    });


    it("Only assign Write ACLs to user, when nothing else is given", () => {

      let bookFixture = createBookFix[5];

      objectAclController.beforeSave(bookFixture,test);

      function test(){

        assert.deepEqual(bookFixture.instance, {
          "name": "name",
          "subTitle": "a subtitle",
          "isbn": 1231,
          "r": {
            "u": [],
            "g": []
          },
          "w": {
            "u": ["aaa", "bbb"],
            "g": []
          }
        });

      }

    });

    it("Only assign Write ACLs to groups, when nothing else is given", () => {

      let bookFixture = createBookFix[6];

      objectAclController.beforeSave(bookFixture,test);

      function test(){

        assert.deepEqual(bookFixture.instance, {
          "name": "name",
          "subTitle": "a subtitle",
          "isbn": 1231,
          "r": {
            "u": [],
            "g": []
          },
          "w": {
            "u": [],
            "g": ["aaa", "bbb"]
          }
        });

      }

    });

  });

});
