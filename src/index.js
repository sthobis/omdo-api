import express from "express";
import http from "http";
import socketio from "socket.io";
import UserManager from "./userManager";

const PORT = process.env.PORT || 3003
const app = express()
const server = http.Server(app)
const io = socketio(server)
const userManager = new UserManager()

const EVENT = {
  CONNECT: "connect",
  CONNECT_ERROR: "connect_error",
  DISCONNECT: "disconnect",
  DISCONNECTING: "disconnecting",
  ERROR: "error",
  CLIENT_JOIN_ROOM: "client_join_room",
  CLIENT_LEAVE_ROOM: "client_leave_room",
  CLIENT_SEND_MESSAGE: "client_send_message",
  SERVER_JOIN_ERROR: "server_join_error",
  SERVER_UPDATE_USER_LIST: "server_update_user_list",
  SERVER_UPDATE_HISTORY: "server_update_history",
}

io.on(EVENT.CONNECT, socket => {

  socket.on(EVENT.CLIENT_JOIN_ROOM, (user, cb) => {
    try {
      const users = userManager.addUser({ ...user, id: socket.id })
      console.log(`${EVENT.CLIENT_JOIN_ROOM} : "${user.name}" has join the room.`)
      socket.broadcast.emit(EVENT.SERVER_UPDATE_USER_LIST, users)
      cb(users)
    } catch (err) {
      console.log(`${EVENT.CLIENT_JOIN_ROOM} : "${user.name}" failed to join the room. Username already taken.`)
      socket.emit(EVENT.SERVER_JOIN_ERROR, err)
      socket.disconnect(true)
    }
  })

  socket.on(EVENT.CLIENT_LEAVE_ROOM, user => {
    console.log(`${EVENT.CLIENT_LEAVE_ROOM} : "${user.name}" has left the room.`)
    userManager.removeUserById(user.id)
    socket.broadcast.emit(EVENT.SERVER_UPDATE_USER_LIST, userManager.users)
  })

  socket.on(EVENT.CLIENT_SEND_MESSAGE, payload => {
    console.log(`${EVENT.CLIENT_SEND_MESSAGE} : "${payload.user.name}" sent a message.`)
    socket.broadcast.emit(EVENT.SERVER_UPDATE_HISTORY, payload)
  })

  socket.on(EVENT.DISCONNECT, reason => {
    console.log(`${EVENT.DISCONNECT} : ${reason}.`)
    const disconnectedUser = userManager.removeUserById(socket.id)
    disconnectedUser && console.log(`${EVENT.DISCONNECT} : "${disconnectedUser.name}" has left the room.`)
    socket.broadcast.emit(EVENT.SERVER_UPDATE_USER_LIST, userManager.users)
  })

  socket.on(EVENT.ERROR, err => {
    console.log(`${EVENT.ERROR} : ${err}`)
  })
})

app.get('/', (req, res) => {
  res.send("Healthy")
})

server.listen(PORT, err => {
  if (err) throw err
  console.log(`Ready on port ${PORT}`)
})