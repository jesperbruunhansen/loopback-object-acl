const CurrentUserUtil = require("./lib/CurrentUserUtil");
const ObjectAcl = require("./lib/ObjectAcl");

class ObjectAclController {

  constructor(Model, options = {}) {
    this.model = Model;
    this.model.observe("before save", (ctx, next) => this.beforeSave(ctx, next));
    this.model.observe("access", (ctx, next) => this.onAccess(ctx, next));
  }

  beforeSave(ctx, next) {

    if (ctx.isNewInstance) {

      if (ctx.instance["$acl"]) {

        if(!ctx.instance["$acl"]["r_perm"] && !ctx.instance["$acl"]["w_perm"]){
          return next(new Error("Saw ACL, but no permissions given"));
        }

        //Resolve read perm
        if (ctx.instance["$acl"]["r_perm"]) {

          let r_users = ctx.instance["$acl"]["r_perm"]["users"] || [];
          let r_groups = ctx.instance["$acl"]["r_perm"]["groups"] || [];

          ctx.instance["r"] = {
            "u": r_users,
            "g": r_groups
          };

        }
        else {
          ctx.instance["r"] = {
            "u": [],
            "g": []
          };
        }

        //Resolve write perm
        if (ctx.instance["$acl"]["w_perm"]) {

          let w_users = ctx.instance["$acl"]["w_perm"]["users"] || [];
          let w_groups = ctx.instance["$acl"]["w_perm"]["groups"] || [];

          ctx.instance["w"] = {
            "u": w_users,
            "g": w_groups
          };

        } else {
          ctx.instance["w"] = {
            "u": [],
            "g": []
          };
        }

        delete ctx.instance["$acl"];
        return next();

      }
      else {

        //No Object ACL's present => public object
        ctx.instance["r"] = {
          "u":["*"],
          "g":["*"],
        };

        ctx.instance["w"] = {
          "u":["*"],
          "g":["*"]
        };


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
