const path = require('path');
const Promise = require("bluebird");
const SIMPLE_APP = path.join(__dirname, '../test-server');
const app = require(path.join(SIMPLE_APP, 'server/server.js'));

Promise.map(["AccessToken", "Book", "Member"], model => {
  return app.models[model].destroyAll(null, {skipAcl: true})
}).then(() => {
  console.log("Deleted ...");
  process.exit();
}).catch(err => {
  console.err(err);
});
