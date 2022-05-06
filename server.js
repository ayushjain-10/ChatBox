const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

const rooms = {name: {}}

app.get('/', (req, res) => {
  res.render('index', {rooms: rooms})
})

app.post('/room', (res, req) => {
  if (rooms[req.body.room] != null) {
    return res.redirect('/')
  }
  rooms[req.body.room] = { users: {} }
  res.redirect(req.body.room)
  // Send message that new room was created
})

app.get('/:room', (req, res) => {
  res.render('room', {roomName: req.params.room})
})

server.listen(3000)

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