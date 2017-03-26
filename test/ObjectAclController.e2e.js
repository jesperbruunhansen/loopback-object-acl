const assert = require('assert');
const path = require('path');
const request = require("supertest");
const randomstring = require("randomstring");
const SIMPLE_APP = path.join(__dirname, 'test-server');
const app = require(path.join(SIMPLE_APP, 'server/server.js'));

describe("ObjectAclController tests", () => {

  let token;

  before(() => {

    const email = randomstring.generate({
      length: 12,
      charset: 'alphabetic'
    });

    return app.models.User.create({
      email: email + "@test.com",
      password: "1234"
    }).then(user => {

      return app.models.AccessToken.create({
        userId: user.id
      }).then(accessToken => {
        token = accessToken.id;
        return Promise.resolve();
      });

    });

  });

  describe("Updating objects", () => {

    let bookId;

    before(() => {
      return app.models.Book.create({
        name: "Clean Code"
      }).then(book => {
        bookId = book.id;
        return Promise.resolve();
      });
    });

    it("Returns OK if updating the object", (done) => {

      request(app)
        .put("/api/books/" + bookId)
        .set({"authorization": token})
        .send({
          "name": "VERY clean code",
          "$acl": {
            "r_perm": {
              "users": ["*"],
              "groups": ["*"]
            },
            "w_perm": {
              "users": ["*"],
              "groups": ["*"]
            }
          }
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {

          if (err) done(err);

          const body = res.body;
          assert.deepEqual(body, {
            "id": bookId,
            "name": "VERY clean code",
            "$acl": {
              "r_perm": {
                "users": ["*"],
                "groups": ["*"]
              },
              "w_perm": {
                "users": ["*"],
                "groups": ["*"]
              }
            }
          });
          done();

        });

    });

    it("Returns OK even if no ACLs are given", done => {

      request(app)
        .put("/api/books/" + bookId)
        .set({"authorization": token})
        .send({
          "name": "VERY clean code v.2"
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {

          if (err) done(err);

          const body = res.body;
          assert.deepEqual(body, {
            "id": bookId,
            "name": "VERY clean code v.2"
          });
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
            "$acl": {
              "r_perm": {
                "users": ["*"],
                "groups": ["*"]
              },
              "w_perm": {
                "users": ["*"],
                "groups": ["*"]
              }
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
        .expect(400)
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
            "$acl": {
              "r_perm": {
                "users": ["aaa", "bbb"],
                "groups": []
              },
              "w_perm": {
                "users": [],
                "groups": []
              }
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
            "$acl": {
              "r_perm": {
                "users": [],
                "groups": ["aaa", "bbb"]
              },
              "w_perm": {
                "users": [],
                "groups": []
              }
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
            "$acl": {
              "r_perm": {
                "users": [],
                "groups": []
              },
              "w_perm": {
                "users": ["aaa", "bbb"],
                "groups": []
              }
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
            "$acl": {
              "r_perm": {
                "users": [],
                "groups": []
              },
              "w_perm": {
                "users": [],
                "groups": ["aaa", "bbb"]
              }
            }
          });

          done();

        });

    });

  });

  describe("Client errors", () => {

    it("Handles wrong permission syntax", done => {

      request(app)
        .post("/api/books")
        .set({"authorization": token})
        .send({
          "name": "name",
          "$acl": {
            "lorem": [],
            "foo": []
          }
        })
        .expect('Content-Type', /json/)
        .expect(400)
        .end(done);

    });

  });

});
