
class AclError extends Error{

  constructor(msg){
    super(msg);
    this.name = "OBJECT_ACL_ERROR";
  }

  status(n){
    this.status = n;
    this.statusCode = n;
    return this;
  }

  name(c){
    this.name = c;
    return this;
  }

}

module.exports = AclError;



