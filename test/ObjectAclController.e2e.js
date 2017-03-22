const assert = require('assert');
const path = require('path');
const request = require("supertest");
const randomstring = require("randomstring");
const SIMPLE_APP = path.join(__dirname, 'test-server');
const app = require(path.join(SIMPLE_APP, 'server/server.js'));

describe("ObjectAclController tests", () => {

  let token;

  before((done) => {

    const email = randomstring.generate({
      length: 12,
      charset: 'alphabetic'
    });

    app.models.User.create({
      email: email + "@test.com",
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

  describe("Before-save parsing", () => {

    it("Parses read and write, when $acl is present", (done) => {

      request(app)
        .post("/api/books")
        .set({"authorization": token})
        .send({
          "name": "name",
          "isbn": 1231,
          "$acl": {
            "r_perm": {
              "users": ["aaa", "bbb"],
              "groups": ["ccc", "ddd"]
            },
            "w_perm": {
              "users": ["aaa", "bbb"],
              "groups": ["ccc", "ddd"]
            }
          }
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {

          if (err) done(err);

          const body = res.body;
          assert.deepEqual(body, {
            "id": body.id,
            "name": "name",
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
          done();

        });

    });

    it("Set public ACL when $acl is NOT present", (done) => {

      request(app)
        .post("/api/books")
        .set({"authorization": token})
        .send({
          "name": "name",
          "isbn": 1231
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {

          if (err) done(err);

          const body = res.body;
          assert.deepEqual(body, {
            "id": body.id,
            "name": "name",
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
          done();

        });

    });

    it("Return error, when $acl is set, but no permission given", (done) => {

      request(app)
        .post("/api/books")
        .set({"authorization": token})
        .send({
          "name": "name",
          "isbn": 1231,
          "$acl": {}
        })
        .expect('Content-Type', /json/)
        .expect(500)
        .end(done);

    });


    it("Only assign Read ACLs to user, when nothing else is given", (done) => {

      request(app)
        .post("/api/books")
        .set({"authorization": token})
        .send({
          "name": "name",
          "isbn": 1231,
          "$acl": {
            "r_perm": {
              "users": ["aaa", "bbb"]
            }
          }
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {

          if (err) done(err);

          const body = res.body;
          assert.deepEqual(body, {
            "id": body.id,
            "name": "name",
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

          done();
        });

    });


    it("Only assign Read ACLs to groups, when nothing else is given", (done) => {

      request(app)
        .post("/api/books")
        .set({"authorization": token})
        .send({
          "name": "name",
          "isbn": 1231,
          "$acl": {
            "r_perm": {
              "groups": ["aaa", "bbb"]
            }
          }
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {

          if (err) done(err);

          const body = res.body;
          assert.deepEqual(body, {
            "id": body.id,
            "name": "name",
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

          done();

        });

    });


    it("Only assign Write ACLs to user, when nothing else is given", (done) => {

      request(app)
        .post("/api/books")
        .set({"authorization": token})
        .send({
          "name": "name",
          "isbn": 1231,
          "$acl": {
            "w_perm": {
              "users": ["aaa", "bbb"]
            }
          }
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {

          if (err) done(err);

          const body = res.body;
          assert.deepEqual(body, {
            "id": body.id,
            "name": "name",
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
          done();

        });

    });

    it("Only assign Write ACLs to groups, when nothing else is given", (done) => {

      request(app)
        .post("/api/books")
        .set({"authorization": token})
        .send({
          "name": "name",
          "isbn": 1231,
          "$acl": {
            "w_perm": {
              "groups": ["aaa", "bbb"]
            }
          }
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {

          if (err) done(err);

          const body = res.body;
          assert.deepEqual(body, {
            "id": body.id,
            "name": "name",
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

          done();

        });

    });

  });

});
