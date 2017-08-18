const assert = require('assert');
const path = require('path');
const request = require("supertest");
const Promise = require("bluebird");
const randomstring = require("randomstring");
const SIMPLE_APP = path.join(__dirname, 'test-server');
const app = require(path.join(SIMPLE_APP, 'server/server.js'));

describe("Object ACL e2e", () => {

  let token;

  before((done) => {

    app.models.Member.create({
      email: "test@test.com",
      password: "1234"
    }).then(() => {

      request(app)
        .post('/api/members/login')
        .send({
          email: "test@test.com",
          password: "1234"
        })
        .end((err, res) => {

          token = res.body;
          done();

        });

    });

  });

  describe("User Read permissions", () => {

    let books;

    before(() => {
      return Promise.all([
        app.models.Book.create({
          "name": "name",
          "isbn": 1231,
          "_acl": {
            "r_perm": {
              "users": [token.userId]
            }
          }
        }),
        app.models.Book.create({
          "name": "name",
          "isbn": 1231,
          "_acl": {
            "r_perm": {
              "users": ["ayx"]
            }
          }
        }),
      ]).then(books_ => {
        books = books_
      });
    });

    it("User 1 has access to Book 1", (done) => {

      request(app)
        .get("/api/books/" + books[0].id)
        .set({"authorization": token.id})
        .expect('Content-Type', /json/)
        .expect(200)
        .end(done);

    });
    it("User 1 return 404 when accessing Book 2", (done) => {

      request(app)
        .get("/api/books/" + books[1].id)
        .set({"authorization": token.id})
        .expect('Content-Type', /json/)
        .expect(404)
        .end(done);

    });

  });

  describe("Public Read permissions", () => {

    let public_book;
    let private_book;

    before(() => {
      // return app.models.Book.destroyAll(null, {skipAcl: true}).then(() => {
      return Promise.all([
        app.models.Book.create({
          "name": "public",
          "isbn": 1231,
        }),
        app.models.Book.create({
          "name": "private",
          "isbn": 1231,
          "_acl": {
            "r_perm": {
              "users": ["1"]
            }
          }
        })
      ]).then(books => {
        public_book = books[0];
        private_book = books[1];
        return Promise.resolve();
        //});
      });

    });

    it("Is publicly readable by all", (done) => {

      request(app)
        .get("/api/books/" + public_book.id)
        .set({"authorization": token.id})
        .expect('Content-Type', /json/)
        .expect(200)
        .end(done);

    });

    it("Should only return the public book, when no currentUser", (done) => {

      request(app)
        .get("/api/books")
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {

          if (err) return done(err);

          let books = res.body;

          assert.equal(books.length, 1);
          assert.equal(books[0].name, "public");

          done();

        });

    });

  });

  describe("Group Read permissions", () => {

    let user1token;
    let user2token;

    let bookId1;
    let bookId2;

    /**
     * 1. Create two users
     *    - First belongs to group: 'aaa'
     *    - Second belongs to group: 'bbb'
     *
     * 2. Log each user in
     *
     * 3. Create two Books
     *    - First has Read ACL to group: 'aaa'
     *    - Second has Read ACL to group: 'bbb'
     */
    before(() => {

      const email1 = randomstring.generate({
        length: 12,
        charset: 'alphabetic'
      });
      const email2 = randomstring.generate({
        length: 12,
        charset: 'alphabetic'
      });

      return app.models.Member.create({
        email: email1 + "@test.com",
        password: "1234",
        acl_groups: ["aaa"]
      }).then(user1 => {

        return app.models.AccessToken.create({
          userId: user1.id
        })

      }).then(accessToken1 => {

        user1token = accessToken1.id;

        return app.models.Member.create({
          email: email2 + "@test.com",
          password: "1234",
          acl_groups: ["bbb"]
        }).then(user2 => {

          return app.models.AccessToken.create({
            userId: user2.id
          });

        });

      }).then(accessToken2 => {

        user2token = accessToken2.id;

        //Create books with groups
        return Promise.all([
          app.models.Book.create({
            "name": "name",
            "isbn": 1231,
            "_acl": {
              "r_perm": {
                "groups": ["aaa"]
              }
            }
          }),
          app.models.Book.create({
            "name": "name",
            "isbn": 1231,
            "_acl": {
              "r_perm": {
                "groups": ["bbb"]
              }
            }
          }),
        ]).then(books => {

          bookId1 = books[0].id;
          bookId2 = books[1].id;
          return Promise.resolve();

        });
      });
    });

    it("Returns OK when User 1 accesses Book 1", (done) => {
      request(app)
        .get("/api/books/" + bookId1)
        .set({"authorization": user1token})
        .expect('Content-Type', /json/)
        .expect(200)
        .end(done);
    });

    it("Returns OK when User 2 accesses Book 2", (done) => {
      request(app)
        .get("/api/books/" + bookId2)
        .set({"authorization": user2token})
        .expect('Content-Type', /json/)
        .expect(200)
        .end(done);
    });

    it("Returns 404 Not Found when User 2 accesses Book 1", done => {
      request(app)
        .get("/api/books/" + bookId1)
        .set({"authorization": user2token})
        .expect('Content-Type', /json/)
        .expect(404)
        .end(done);
    });

    it("Returns 404 Not Found when User 1 accesses Book 1", done => {
      request(app)
        .get("/api/books/" + bookId2)
        .set({"authorization": user1token})
        .expect('Content-Type', /json/)
        .expect(404)
        .end(done);
    });

  });

  describe("Combining User and Group read permissions", () => {

    let token1;
    let token2;

    let book1;
    let book2;

    before(() => {

      const email1 = randomstring.generate({
        length: 12,
        charset: 'alphabetic'
      });
      const email2 = randomstring.generate({
        length: 12,
        charset: 'alphabetic'
      });

      return Promise.all([

        //User
        app.models.Member.create({
          email: email1 + "@test.com",
          password: "1234",
          acl_groups: ["group-id-a"]
        }).then(user => {

          //Token
          return app.models.AccessToken.create({
            userId: user.id
          }).then(token => {

            token1 = token;

            //Book
            return app.models.Book.create({
              "name": "foo",
              "_acl": {
                "r_perm": {
                  "users": [user.id],
                  "groups": ["group-id-b"]
                }
              }
            }).then(book => {
              book1 = book;
              return Promise.resolve();
            });

          });

        }),

        //User
        app.models.Member.create({
          email: email2 + "@test.com",
          password: "1234",
          acl_groups: ["group-id-b"]
        }).then(user => {

          //Token
          return app.models.AccessToken.create({
            userId: user.id
          }).then(token => {

            token2 = token;

            //Book
            return app.models.Book.create({
              "name": "foo",
              "_acl": {
                "r_perm": {
                  "users": [user.id],
                  "groups": ["group-id-a"]
                }
              }
            }).then(book => {
              book2 = book;
              return Promise.resolve();
            });

          });

        }),

      ]);

    });

    it("User 1 has access to Book 1", done => {

      request(app)
        .get("/api/books/" + book1.id)
        .set({"authorization": token1.id})
        .expect('Content-Type', /json/)
        .expect(200)
        .end(done);

    });
    it("User 2 has access to Book 2", done => {

      request(app)
        .get("/api/books/" + book2.id)
        .set({"authorization": token2.id})
        .expect('Content-Type', /json/)
        .expect(200)
        .end(done);

    });

  });


});
