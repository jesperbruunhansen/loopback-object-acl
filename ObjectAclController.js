const CurrentUserUtil = require("./ObjectAcl/CurrentUserUtil");
const ObjectAcl = require("./ObjectAcl/ObjectAcl");

class ObjectAclController {

  constructor(Model, options = {}) {
    this.model = Model;
    this.model.observe("access", (ctx, next) => this.onAccess(ctx, next));
  }

  onAccess(ctx, next) {

    const currentUserUtil = new CurrentUserUtil({
      currentUser: ctx.options.currentUser,
      app: this.model.app
    });

    let objectAcl = new ObjectAcl({
      currentUser: currentUserUtil,
      query: ctx.query
    });

    objectAcl.buildReadQuery();
    next();
  }

}

module.exports = (model, options) => new ObjectAclController(model, options);
