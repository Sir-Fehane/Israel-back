import Ws from 'App/Services/Ws'
Ws.boot()

const rooms = {}; // Almacena las salas y los jugadores

Ws.io.on('connection', (socket) => {
  const clientId = socket.id;

  socket.on('joinRoom', (roomCode, username) => {
    if (!rooms[roomCode]) {
      rooms[roomCode] = { players: [] };
    }

    // Agregar el jugador a la sala
    rooms[roomCode].players.push({ id: clientId, username });

    // Emitir a todos los jugadores de la sala que un nuevo jugador se ha unido
    socket.join(roomCode);

    socket.to(roomCode).emit('playerJoined', { username });

    // Si hay dos jugadores, puedes notificar a ambos que están listos
    if (rooms[roomCode].players.length === 2) {
      Ws.io.to(roomCode).emit('startGame', {
        message: 'Ambos jugadores están listos. ¡Comencemos!'
      });
    }
  });

  socket.on('formSubmit', ({ roomCode, formData }) => {
    // Aquí puedes manejar el envío del formulario
    console.log('Form data received for room:', roomCode, formData);
    // Notificar a ambos jugadores que el formulario se ha enviado y redirigirlos
    Ws.io.to(roomCode).emit('navigateToBoard', formData);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${clientId}`);

    // Aquí podrías manejar la lógica para quitar al jugador de la sala
    // Si el jugador desconectado es parte de una sala, elimínalo de la lista
    for (const roomCode in rooms) {
      rooms[roomCode].players = rooms[roomCode].players.filter(player => player.id !== clientId);
      if (rooms[roomCode].players.length < 1) {
        delete rooms[roomCode]; // Elimina la sala si no hay jugadores
      }
    }
  });


  
});