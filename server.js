const io = require('socket.io')(3000)

const users = {}

// gives each user its own socket
io.on('connection', socket => {
  socket.on('new-user', name => {
    users[socket.id] = name
    // Every time someone connects, we are sending a message down to the client
    socket.broadcast.emit('user-connected', name)
  })
//   Handling event
  socket.on('send-chat-message', message => {
    //   send information to every single user connected to the server except the one who sent it
    socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] })
  })
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id])
    delete users[socket.id]
  })
})