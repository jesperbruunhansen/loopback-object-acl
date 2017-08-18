const loopback = require("loopback");
const assert = require("assert");
const app = loopback;
app.loopback = loopback;

const mixin = require("../ObjectAclController");
app.loopback.modelBuilder.mixins.define("ObjectAclController", mixin);

const dataSource = app.createDataSource({
  "host": "localhost",
  "port": 27017,
  "database": "momentify-test",
  "username": "",
  "password": "",
  "name": "mongodb",
  "connector": "mongodb"
});

describe("test", () => {

  it("Should work", () => {

    const Member = dataSource.createModel("Member1",
      {base: "User"},
      {mixins: {ObjectAclController: true}
    });

    return Member.create({
      email: "object@test.com",
      password: "1235"
    }).then(meber => {

      Member.findById(meber.id).then(m => {
        m
      });

    })

  });

});
