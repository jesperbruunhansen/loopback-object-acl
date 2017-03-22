
class DataSourceParser {

  constructor(instance){
    this.instance = instance;
  }

  parse(){

    this.instance["$acl"] = {
      "r_perm":{
        "users": this.instance["r"]["u"],
        "groups": this.instance["r"]["g"]
      },
      "w_perm":{
        "users": this.instance["w"]["u"],
        "groups": this.instance["w"]["g"]
      }
    };

    delete this.instance["r"];
    delete this.instance["w"];

  }

  hasAclPerms(){
    return !!this.instance["r"] || !!this.instance["w"];
  }
}

module.exports = DataSourceParser;
