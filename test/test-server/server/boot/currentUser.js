module.exports = function(app) {
  app.remotes().phases
    .addBefore('invoke', 'options-from-request')
    .use(function(ctx, next) {
      if (!ctx.args.options.accessToken) return next();
      const User = app.models.User;
      User.findById(ctx.args.options.accessToken.userId, function(err, user) {
        if (err) return next(err);
        ctx.args.options.currentUser = user;
        next();
      });
    });
};
