
class ObjectAcl {

  constructor(config) {
    this.CurrentUser = config.currentUser;
    this._query = config.query;
    this._aclReadQuery = [];
  }

  buildReadQuery(){
    this.setReadQuery();
    this.setWhereQuery();
  }

  setReadQuery() {
    this.aclReadQuery = [
      this.getUserReadQuery(),
      this.getGroupsReadQuery()
    ];
  }

  getUserReadQuery() {
    return {
      "r.u": {
        "inq": this.CurrentUser.getIdForQuery()
      }
    };
  }

  getGroupsReadQuery() {
    return {
      "r.g": {
        "inq": this.CurrentUser.getGroupAcls()
      }
    };
  }

  setWhereQuery(){
    if(this.query.where){
      if(this.query.where.or){
        this.query.where.or.concat(this.aclReadQuery);
      } else {
        this.query.where.or = this.aclReadQuery;
      }
    } else {
      this.query.where = { or: this.aclReadQuery };
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

}

module.exports = ObjectAcl;
