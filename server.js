const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const path = require('path');

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

const rooms = {}

app.get('/', (req, res) => {
  res.render('index', { rooms: rooms })
})

app.post('/room', (req, res) => {
  if (rooms[req.body.room] != null) {
    return res.redirect('/')
  }
  rooms[req.body.room] = { users: {} }
  res.redirect(req.body.room)
  // Send message that new room was created
  io.emit('room-created', req.body.room)
})

app.get('/:room', (req, res) => {
  if (rooms[req.params.room] == null) {
    return res.redirect('/')
  }
  res.render('room', { roomName: req.params.room })
})

io.on('connection', socket => {
  socket.on('new-user', (room, name) => {
    // Check if the room exists
    if (!rooms[room]) {
      console.error(`Room ${room} does not exist`);
      return;
    }

    socket.join(room)
    rooms[room].users[socket.id] = name
    socket.to(room).emit('user-connected', name)
  })

  socket.on('send-chat-message', (room, message) => {
    if (!rooms[room]) {
      console.error(`Room ${room} does not exist`);
      return;
    }

    socket.to(room).emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
  })

  socket.on('disconnect', () => {
    getUserRooms(socket).forEach(room => {
      if (rooms[room] && rooms[room].users[socket.id]) {
        io.to(room).emit('user-disconnected', rooms[room].users[socket.id]);
        delete rooms[room].users[socket.id]
      }
    })
  })
})

function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name)
    return names
  }, [])
}

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
