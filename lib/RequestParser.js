class RequestParser {


  constructor(instance) {
    this.instance = instance;
  }

  resolveReadPerms() {
    if (this.hasReadPerm()) {

      let r_users = this.getReadPermissions("users");
      let r_groups = this.getReadPermissions("groups");
      this.setReadPermissions(r_users, r_groups);

    } else {
      this.setReadPermissions([], []);
    }

  }

  hasReadPerm() {
    return !!this.instance["$acl"]["r_perm"];
  }

  getReadPermissions(type) {
    return this.instance["$acl"]["r_perm"][type] || []
  }

  setReadPermissions(users, groups) {
    this.instance["r"] = {
      "u": users,
      "g": groups
    }
  }

  resolveWritePerms() {
    if (this.hasWritePerm()) {

      let w_users = this.getWritePermissions("users");
      let w_groups = this.getWritePermissions("groups");

      this.setWritePermissions(w_users, w_groups);

    } else {
      this.setWritePermissions([], []);
    }

  }

  hasWritePerm() {
    return !!this.instance["$acl"]["w_perm"];
  }

  getWritePermissions(type) {
    return this.instance["$acl"]["w_perm"][type] || [];
  }

  setWritePermissions(users, groups) {
    this.instance["w"] = {
      "u": users,
      "g": groups
    }
  }

  hasAcl() {
    return !!this.instance["$acl"];
  }

  clearAclOnRequest() {
    delete this.instance["$acl"];
    delete this.instance.__data["$acl"];
  }

}

module.exports = RequestParser;
