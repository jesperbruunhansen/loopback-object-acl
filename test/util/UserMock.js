
class UserMock {

  constructor(properties){
    Object.assign(this, properties)
  }

  /**
   * Mock Save-call
   * @param data
   * @return {Promise}
   */
  save(data){
    return new Promise((resolve, reject) => {
      Object.assign(this, data);
      resolve(this);
    });
  }

}

module.exports = UserMock;
