const socket = io('http://localhost:3000')
const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')

const name = prompt('What is your name?')
appendMessage(`Welcome ${name}`)
socket.emit('new-user', name)

socket.on('chat-message', data => {
    // Show message in the DOM
  appendMessage(`${data.name}: ${data.message}`)
})

socket.on('user-connected', name => {
  appendMessage(`${name} connected`)
})

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`)
})

messageForm.addEventListener('submit', e => {
//Prevent Page Refresh so that we dont lose chat messages
  e.preventDefault()
  const message = messageInput.value
  appendMessage(`You: ${message}`)
//   send information from client to the server
  socket.emit('send-chat-message', message)
//   Empty the input field after sending message
  messageInput.value = ''
})

// Add message to the DOM
function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.append(messageElement)
}