const ClientParser = require("./ClientParser");
const DataSourceParser = require("./DataSourceParser");

class RequestParser {


  constructor(instance) {
    this.Client = new ClientParser(instance);
    this.DataSource = new DataSourceParser(instance);
  }

}

module.exports = RequestParser;
