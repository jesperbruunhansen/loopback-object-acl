
class AclError extends Error{

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



