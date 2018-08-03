class UserManager {
  constructor() {
    this.users = []
  }

  addUser(newUser) {
    if (this.users.filter(user => user.name === newUser.name).length) throw "Username already used"
    this.users.push(newUser)
    return this.users
  }

  removeUserById(userId) {
    const userIndex = this.users.findIndex(user => user.id === userId)
    return userIndex !== -1
      ? this.users.splice(userIndex, 1)[0]
      : null
  }
}

export default UserManager
