class RequestParser {


  constructor(instance) {
    this.instance = instance;
  }

  hasAcl() {
    return !!this.instance["$acl"];
  }

  hasReadPerm() {
    return !!this.instance["$acl"]["r_perm"];
  }

  hasWritePerm() {
    return !!this.instance["$acl"]["w_perm"];
  }

  resolveReadPerms() {
    if (this.hasReadPerm()) {

      let r_users = this.instance["$acl"]["r_perm"]["users"] || [];
      let r_groups = this.instance["$acl"]["r_perm"]["groups"] || [];
      this.setReadPermissions(r_users, r_groups);

    } else {
      this.setReadPermissions([], []);
    }

  }

  resolveWritePerms() {
    if (this.hasWritePerm()) {

      let r_users = this.instance["$acl"]["w_perm"]["users"] || [];
      let r_groups = this.instance["$acl"]["w_perm"]["groups"] || [];

      this.setWritePermissions(r_users, r_groups);

    } else {
      this.setWritePermissions([], []);
    }

  }

  setReadPermissions(users, groups) {
    this.instance["r"] = {
      "u": users,
      "g": groups
    }
  }


  setWritePermissions(users, groups) {
    this.instance["w"] = {
      "u": users,
      "g": groups
    }
  }

  clearAclOnRequest() {
    delete this.instance["$acl"];
  }

}

module.exports = RequestParser;
