const CurrentUserUtil = require("./lib/CurrentUserUtil");
const ObjectAcl = require("./lib/ObjectAcl");
const RequestParser = require("./lib/RequestParser");
const AclError = require("./lib/AclError");

class ObjectAclController {

  constructor(Model, options = {}) {
    this.model = Model;
    this.model.observe("before save", (ctx, next) => this.beforeSave(ctx, next));
    this.model.observe("access", (ctx, next) => this.onAccess(ctx, next));
    this.model.afterRemote("**", (ctx, instance, next) => this.afterRemote(ctx, instance, next));
  }

  afterRemote(ctx, instance, next) {
    if (instance) {
      const parser = new RequestParser(instance);
      parser.DataSource.parse();

    }
    next();
  }

  beforeSave(ctx, next) {

    if (ctx.isNewInstance) {

      const parser = new RequestParser(ctx.instance);

      if (parser.Client.hasAcl()) {

        if (!parser.Client.hasReadPerm() && !parser.Client.hasWritePerm()) {

          return next(
            new AclError("No permissions found").status(400)
          );
        }

        parser.Client.resolveReadPerms();
        parser.Client.resolveWritePerms();
        parser.Client.clearAclOnRequest();

        return next();

      }
      else {

        //No Object ACL's present == public object
        parser.Client.setReadPermissions(["*"], ["*"]);
        parser.Client.setWritePermissions(["*"], ["*"]);

        return next();
      }

    }

    next();
  }

  onAccess(ctx, next) {

    if(ctx.options.skipAcl){
      return next();
    }

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
