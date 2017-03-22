const CurrentUserUtil = require("./lib/CurrentUserUtil");
const ObjectAcl = require("./lib/ObjectAcl");
const RequestParser = require("./lib/RequestParser");

class ObjectAclController {

  constructor(Model, options = {}) {
    this.model = Model;
    this.model.observe("before save", (ctx, next) => this.beforeSave(ctx, next));
    this.model.observe("access", (ctx, next) => this.onAccess(ctx, next));
    this.model.afterRemote("**", (ctx, instance, next) => this.afterRemote(ctx, instance, next));
  }

  afterRemote(ctx, instance, next){
    next();
  }

  beforeSave(ctx, next) {

    if (ctx.isNewInstance) {

      const requestParser = new RequestParser(ctx.instance);

      if (requestParser.hasAcl()) {

        if (!requestParser.hasReadPerm() && !requestParser.hasWritePerm()) {
          return next({message:"Saw ACL, but no permissions given"});
        }

        requestParser.resolveReadPerms();
        requestParser.resolveWritePerms();
        requestParser.clearAclOnRequest();

        return next();

      }
      else {

        //No Object ACL's present == public object
        requestParser.setReadPermissions(["*"], ["*"]);
        requestParser.setWritePermissions(["*"], ["*"]);

        return next();
      }

    }

    next();
  }

  onAccess(ctx, next) {

    if (!ctx.options.currentUser) {
      throw new Error("currentUser not set on ctx");
    }

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
