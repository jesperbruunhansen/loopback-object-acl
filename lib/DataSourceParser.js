
class DataSourceParser {

  constructor(instance){
    this.instance = instance;
    this.isArray = Array.isArray(this.instance);
  }

  parse(){

    if(this.isArray){
      this.instance.forEach(o => this._parse(o));
    } else {
      this._parse(this.instance);
    }
  }

  _parse(instance){
    if(this.hasAclPerms(instance)){
      instance["_acl"] = {
        "r_perm":{
          "users": instance["r"]["u"],
          "groups": instance["r"]["g"]
        },
        "w_perm":{
          "users": instance["w"]["u"],
          "groups": instance["w"]["g"]
        }
      };

      delete instance["r"];
      delete instance["w"];
      delete instance.__data["r"];
      delete instance.__data["w"];
    }
  }

  hasAclPerms(instance){
    return !!instance["r"] || !!instance["w"];
  }
}

module.exports = DataSourceParser;
