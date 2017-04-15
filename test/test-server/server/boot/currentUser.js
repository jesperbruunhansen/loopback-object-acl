"use strict";

module.exports = function(app) {
  app.remotes().phases
    .addBefore('invoke', 'options-from-request')
    .use(function(ctx, next) {

      if (!ctx.args.options || !ctx.args.options.accessToken) return next();

      const Member = app.models.Member;

      Member.findById(ctx.args.options.accessToken.userId, null, {
        skipAcl:true
      }).then(user => {

        if(!user) return next("AccessToken invalid");

        ctx.args.options.currentUser = user;
        next();

      }).catch(next);
    });
};
