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
      const users = userManager.addUser(user)
      socket.broadcast.emit(EVENT.SERVER_UPDATE_USER_LIST, users)
      cb(users)
    } catch (err) {
      socket.emit(EVENT.SERVER_JOIN_ERROR, err)
    }
  })

  socket.on(EVENT.CLIENT_LEAVE_ROOM, user => {
    socket.broadcast.emit(EVENT.SERVER_UPDATE_USER_LIST, userManager.removeUser(user))
  })

  socket.on(EVENT.CLIENT_SEND_MESSAGE, payload => {
    socket.broadcast.emit(EVENT.SERVER_UPDATE_HISTORY, payload)
  })

  socket.on(EVENT.DISCONNECT, reason => {
    console.log(`DISCONNECT : ${reason}`)
  })

  socket.on(EVENT.DISCONNECTING, reason => {
    console.log(`DISCONNECTING : ${reason}`)
  })

  socket.on(EVENT.ERROR, err => {
    console.log(`ERROR : ${err}`)
  })
})

app.get('/', (req, res) => {
  res.send("Healthy")
})

server.listen(PORT, err => {
  if (err) throw err
  console.log(`Ready on port ${PORT}`)
})