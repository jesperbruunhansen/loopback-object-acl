const mongodb = require("mongodb");

class ClientParser {

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
    return !!this.instance["_acl"]["r_perm"];
  }

  getReadPermissions(type) {
    return this.instance["_acl"]["r_perm"][type] || []
  }

  static ObjectID(id) {
    if (id instanceof mongodb.ObjectID) {
      return id;
    }
    if (typeof id !== 'string') {
      return id;
    }
    try {
      // MongoDB's ObjectID constructor accepts number, 12-byte string or 24-byte
      // hex string. For LoopBack, we only allow 24-byte hex string, but 12-byte
      // string such as 'line-by-line' should be kept as string
      if (/^[0-9a-fA-F]{24}$/.test(id)) {
        return new mongodb.ObjectID(id);
      } else {
        return id;
      }
    } catch (e) {
      return id;
    }
  }

  setReadPermissions(users, groups) {
    this.instance["r"] = {
      "u": users.map(u => ClientParser.ObjectID(u)),
      "g": groups.map(g => ClientParser.ObjectID(g))
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
    return !!this.instance["_acl"]["w_perm"];
  }

  getWritePermissions(type) {
    return this.instance["_acl"]["w_perm"][type] || [];
  }

  setWritePermissions(users, groups) {
    this.instance["w"] = {
      "u": users,
      "g": groups
    }
  }

  hasAcl() {
    return !!this.instance["_acl"];
  }

  clearAclOnRequest() {
    delete this.instance["_acl"];
    delete this.instance.__data["_acl"];
  }


}

module.exports = ClientParser;
