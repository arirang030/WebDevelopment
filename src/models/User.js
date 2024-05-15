"use strict";

const UserStorage = require('./UserStorage');

class User {
  constructor(body) {
    this.body = body;
  }

  async login() {
    const client = this.body;
    try {
      const user = await UserStorage.getUserInfo(client.id);
      if (user) {
        if (user.id === client.id && user.psword === client.psword) {
          return { success: true, msg: `반갑습니다! ${user.name}님` };
        }
        return { success: false, msg: "비밀번호가 일치하지 않습니다."};
      }
      return { success: false, msg: "존재하지 않는 아이디입니다."};
    } catch (err) {
      return { success: false, err };
    }
  }

  async register() {
    const client = this.body;
    const user = await UserStorage.getUserInfo(client.id);
    if (user) {
      return { success: false, msg: "이미 존재하는 아이디입니다. 다른 아이디를 입력해 주세요."};
    }
    const response = await UserStorage.save(client);
    return response;
  }
}

module.exports = User;