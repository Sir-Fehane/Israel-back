import Ws from 'App/Services/Ws'
Ws.boot()

const rooms = {}; // Almacena las salas y los jugadores

Ws.io.on('connection', (socket) => {
  const clientId = socket.id;

  

  socket.on('formSubmit', ({ roomCode, formData }) => {
    // Aquí puedes manejar el envío del formulario
    console.log('Form data received for room:', roomCode, formData);
    // Notificar a ambos jugadores que el formulario se ha enviado y redirigirlos
    Ws.io.to(roomCode).emit('navigateToBoard', formData);
  });


  socket.on('joinRoom', (roomCode, username) => {
    if (!rooms[roomCode]) {
      rooms[roomCode] = { players: [], currentPlayer: null };
    }

    // Agregar el jugador a la sala
    rooms[roomCode].players.push({ id: clientId, username });

    // Emitir a todos los jugadores de la sala que un nuevo jugador se ha unido
    socket.join(roomCode);
    console.log(rooms[roomCode].players)
    socket.to(roomCode).emit('playerJoined', { username });

    // Si hay dos jugadores, asignar el turno al primero que se unió
    if (rooms[roomCode].players.length === 2) {
      rooms[roomCode].currentPlayer = rooms[roomCode].players[0].id; // El primer jugador
      Ws.io.to(roomCode).emit('startGame', {
        message: 'Ambos jugadores están listos. ¡Comencemos!',
        currentPlayer: rooms[roomCode].currentPlayer,
      });
    }
  });

  socket.on('move', ({ roomCode, board, currentPlayer }) => {
    // Cambiar el turno al siguiente jugador
    console.log('Move received:', roomCode, board, currentPlayer);
    const room = rooms[roomCode];
    console.log(room)
    console.log(room.players)
    //Aqui se muere
    const nextPlayer = room.players.find(player => player.id !== currentPlayer);
    room.currentPlayer = nextPlayer.id;

    // Emitir el movimiento y el próximo jugador
    Ws.io.to(roomCode).emit(`move_${roomCode}`, {
      board,
      currentPlayer: room.currentPlayer,
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${clientId}`);
    for (const roomCode in rooms) {
      rooms[roomCode].players = rooms[roomCode].players.filter(player => player.id !== clientId);
      if (rooms[roomCode].players.length < 1) {
        delete rooms[roomCode]; // Elimina la sala si no hay jugadores
      }
    }
  });

  socket.on('joinWithPlayers', ({ roomCode, playerOne, playerTwo }) => {
    if (!rooms[roomCode]) {
      rooms[roomCode] = { players: [], currentPlayer: null };
    }
  
    // Almacenar ambos jugadores en la sala
    rooms[roomCode].players = [
      { id: clientId, username: playerOne },
      { id: clientId, username: playerTwo }
    ];
  
    // Unirse a la sala
    socket.join(roomCode);
  
    // Emitir el evento de que ambos jugadores se unieron
    Ws.io.to(roomCode).emit('playersJoined', { playerOne, playerTwo });
  
    // Iniciar el juego si hay dos jugadores
    if (rooms[roomCode].players.length === 2) {
      rooms[roomCode].currentPlayer = rooms[roomCode].players[0].id; // Primer jugador
      Ws.io.to(roomCode).emit('startGame', {
        message: 'Ambos jugadores están listos. ¡Comencemos!',
        currentPlayer: rooms[roomCode].currentPlayer,
      });
    }
  });
  
});