class UserManager {
  constructor() {
    this.users = []
  }

  addUser(newUser) {
    if (this.users.filter(user => user.name === newUser.name).length) throw "Username already used"
    this.users = this.users.push(newUser)
    return this.users
  }

  removeUser(oldUser) {
    const userIndex = this.users.findIndex(user => user.name === oldUser.name)
    this.users.splice(userIndex, 1)
    return this.users
  }
}

export default UserManager
