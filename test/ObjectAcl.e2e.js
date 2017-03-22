const assert = require('assert');
const path = require('path');
const request = require("supertest");
const Promise = require("bluebird");

const SIMPLE_APP = path.join(__dirname, 'test-server');
const app = require(path.join(SIMPLE_APP, 'server/server.js'));

describe("Object ACL e2e", () => {

  let token;

  before((done) => {

    app.models.User.create({
      email: "test@test.com",
      password: "1234"
    }).then(() => {

      request(app)
        .post('/api/users/login')
        .send({
          email: "test@test.com",
          password: "1234"
        })
        .end((err, res) => {

          token = res.body.id;
          done();

        });

    });

  });

  describe("Read operations", () => {

    before(() => {
      return Promise.all([
        app.models.Book.create({
          "name": "name",
          "isbn": 1231,
          "$acl": {
            "r_perm": {
              "users": ["1"]
            }
          }
        }),
        app.models.Book.create({
          "name": "name",
          "isbn": 1231,
          "$acl": {
            "r_perm": {
              "users": ["2"]
            }
          }
        }),
      ]);

    });

    it("User 1 has access to Book 1", (done) => {

      request(app)
        .get("/api/books/1")
        .set({"authorization": token})
        .expect('Content-Type', /json/)
        .expect(200)
        .end(done);

    });
    it("User 1 return 404 when accessing Book 2", (done) => {

      request(app)
        .get("/api/books/2")
        .set({"authorization": token})
        .expect('Content-Type', /json/)
        .expect(404)
        .end(done);

    });

  });

});
