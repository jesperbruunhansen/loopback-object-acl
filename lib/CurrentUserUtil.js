class CurrentUserUtil {

  constructor(options = {}) {
    this._currentUser = options.currentUser;
    this._app = options.app;
    this._aclPropertyName = options.aclPropertyName || "acl_groups";
  }

  /**
   * Return all AclGroup-ids for current user
   *
   * Use on creation of new user
   */
  fetchAclRelations(id) {

  }

  /**
   * Persists ACL relations to User
   * @param {Array<String>} relations
   * @return Promise <User>
   */
  saveAclRelations(relations) {
    let acl = {};
    acl[this._aclPropertyName] = relations;
    return this.currentUser.save(acl);
  }

  /**
   * Get Current User ACL Relations
   * @return {Array.<String>}
   */
  getGroupAcls() {
    let groups = this.currentUser[this._aclPropertyName] || [];
    return groups.map(group => group.toString());
  }

  /**
   * Returns Current User's id in array
   * @return {Array<String>}
   */
  getIdForQuery() {
    return [this.currentUser.id.toString()]; //Query 'inq' only accepts arrays
  }

  get currentUser() {
    if (!this._currentUser) throw new Error("Current user not set");
    return this._currentUser;
  }

  get app(){
    if (!this._app) throw new Error("App object not set");
    return this._app;
  }

}
module.exports = CurrentUserUtil;
