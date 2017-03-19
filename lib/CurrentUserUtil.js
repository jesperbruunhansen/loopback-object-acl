class CurrentUserUtil {

  constructor(options) {
    this._currentUser = options.currentUser;
    this._app = options.app;
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
    return this.currentUser.save({"acl_groups": relations});
  }

  /**
   * Get Current User ACL Relations
   * @return {Array.<String>}
   */
  getGroupAcls() {
    return this.currentUser.acl_groups;
  }

  /**
   * Returns Current User's id in array
   * @return {Array<String>}
   */
  getIdForQuery() {
    return [this.currentUser.id]; //Query 'inq' only accepts arrays
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
