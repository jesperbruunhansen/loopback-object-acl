const assert = require('assert');
const path = require('path');
const request = require("supertest");
const Promise = require("bluebird");
const randomstring = require("randomstring");
const SIMPLE_APP = path.join(__dirname, 'test-server');
const app = require(path.join(SIMPLE_APP, 'server/server.js'));

describe("ACL's on user-model", () => {

  let test_users;
  let token;

  before(() => {

    const email1 = randomstring.generate({length: 12, charset: 'alphabetic'});
    const email2 = randomstring.generate({length: 12, charset: 'alphabetic'});
    const email3 = randomstring.generate({length: 12, charset: 'alphabetic'});
    const email4 = randomstring.generate({length: 12, charset: 'alphabetic'});

    return app.models.Member.destroyAll(null, {skipAcl:true}).then(() => {
      return Promise.all([
        app.models.Member.create({
          email: email1 + "@test.com",
          password: "1234",
          acl_groups: ["test-group-1"],
          "_acl": {
            "r_perm": {
              "groups": ["test-group-1"]
            }
          }
        }).then(user => {
          app.models.AccessToken.create({
            userId: user.id
          }).then(atoken => {
            token = atoken;
            return Promise.resolve();
          })
        }),
        app.models.Member.create({
          email: email2 + "@test.com",
          password: "1234",
          acl_groups: ["test-group-1"],
          "_acl": {
            "r_perm": {
              "groups": ["test-group-1"]
            }
          }
        }),
        app.models.Member.create({
          email: email3 + "@test.com",
          password: "1234",
          acl_groups: ["test-group-2"],
          "_acl": {
            "r_perm": {
              "groups": ["test-group-2"]
            }
          }
        }),
        app.models.Member.create({
          email: email4 + "@test.com",
          password: "1234",
          acl_groups: ["test-group-2"],
          "_acl": {
            "r_perm": {
              "groups": ["test-group-2"]
            }
          }
        }),
      ]).then(users_ => {
        test_users = users_.filter(u => !!u);
        return Promise.resolve();
      });
    });

  });

  it("Should only return users of same acl group", (done) => {

    request(app)
      .get("/api/members/")
      .set({"authorization": token.id})
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {

        if (err) return done(err);

        let users = res.body;

        assert.equal(users.length, 2);
        assert.equal(users[0].acl_groups[0], "test-group-1");
        assert.equal(users[1].acl_groups[0], "test-group-1");
        done();

      });

  });

  it("Should return OK when accessing user within same group", (done) => {

    request(app)
      .get("/api/members/" + test_users[0].id)
      .set({"authorization": token.id})
      .expect('Content-Type', /json/)
      .expect(200)
      .end(done);

  });
  it("Should return 404 when accessing user without same group", (done) => {

    request(app)
      .get("/api/members/" + test_users[1].id)
      .set({"authorization": token.id})
      .expect('Content-Type', /json/)
      .expect(404)
      .end(done);

  });

});
