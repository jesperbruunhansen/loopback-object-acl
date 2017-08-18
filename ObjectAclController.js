const CurrentUserUtil = require("./lib/CurrentUserUtil");
const ObjectAcl = require("./lib/ObjectAcl");
const RequestParser = require("./lib/RequestParser");
const AclError = require("./lib/AclError");

class ObjectAclController {

  constructor(Model, options = {}) {
    this.model = Model;
    this.model.settings.strictObjectIDCoercion = true;
    this.model.observe("before save", (ctx, next) => this.beforeSave(ctx, next));
    this.model.observe("access", (ctx, next) => this.onAccess(ctx, next, options));
    this.model.afterRemote("**", (ctx, instance, next) => this.afterRemote(ctx, instance, next));
    //
  }

  afterRemote(ctx, instance, next) {

    if (instance) {
      const parser = new RequestParser(instance);
      parser.DataSource.parse();

    }
    next();
  }

  beforeSave(ctx, next) {

    //Set flag for onAccess to skip ACL's for isValid() check
    if (this.model.base.modelName === "User") {
      ctx.options.userBeforeSave = true;
    }

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

  onAccess(ctx, next, options) {

    //From options
    if (ctx.options.skipAcl) {
      return next();
    }

    //Skip ACLs when isValid()-check is made on User model
    if (ctx.options.userBeforeSave){
      return next();
    }

    //If no CurrentUser (un-authenticated request is made), allow only
    //for public objects to be returned
    if (!ctx.options.currentUser) {
      let objectAcl = new ObjectAcl({query:ctx.query});
      objectAcl.setPublicReadQuery();
      return next();
    }

    const currentUserUtil = new CurrentUserUtil({
      currentUser: ctx.options.currentUser,
      app: this.model.app,
      aclPropertyName:options.aclPropertyName
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
