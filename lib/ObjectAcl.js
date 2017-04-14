
class ObjectAcl {

  constructor(config) {
    this._currentUser = config.currentUser;
    this._query = config.query;
    this._aclReadQuery = [];
  }

  buildReadQuery(){
    this.setReadQuery();
    this.setWhereQuery(this.aclReadQuery);
  }

  setReadQuery() {
    this.aclReadQuery = [
      this.getUserReadQuery(),
      this.getGroupsReadQuery()
    ];
  }

  setPublicReadQuery(){
    this.setWhereQuery([
      {"r.u": {"inq":"*"}},
      {"r.g": {"inq":"*"}}
    ])
  }

  getUserReadQuery() {
    return {
      "r.u": {
        "inq": this.currentUser.getIdForQuery().concat("*")
      }
    };
  }

  getGroupsReadQuery() {
    return {
      "r.g": {
        "inq": this.currentUser.getGroupAcls().concat("*")
      }
    };
  }

  setWhereQuery(query = []){
    if(this.query.where){
      if(this.query.where.or){
        this.query.where.or = this.query.where.or.concat(query);
      } else {
        this.query.where.or = query;
      }
    } else {
      this.query.where = { or: query};
    }
  }


  get aclReadQuery(){
    return this._aclReadQuery;
  }
  set aclReadQuery(ids){
    this._aclReadQuery = ids;
  }

  get query(){
    return this._query;
  }

  get currentUser(){
    return this._currentUser;
  }


}

module.exports = ObjectAcl;
