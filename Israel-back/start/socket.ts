import Ws from 'App/Services/Ws'
Ws.boot()

/**
 * Listen for incoming socket connections
 */
Ws.io.on('connection', (socket) => {
  const client = socket.id

  socket.on('data:emit', async (data) => {

    console.log(data)
    socket.emit('data:listener', data)
    socket.broadcast.emit('data:listener', data)
  }) 

  socket.on('join', (username) => {
    console.log(`${username} has joined the chat`)
    socket.broadcast.emit('message', `${username} has joined the chat`)
  })

  socket.on('message', (message) => {
    console.log('Message received:', message)
    socket.emit('message', message)
    socket.broadcast.emit('message', message)
  })

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${client}`)
  })

  socket.on('data:emit', async (data) => {
    console.log(data)
    socket.emit('data:listener', data)
    socket.broadcast.emit('data:listener', data)
  })
})
