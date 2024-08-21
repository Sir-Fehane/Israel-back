import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Game from 'App/Models/Game'
import Ws from 'App/Services/Ws'
import User from 'App/Models/User'
import { randomBytes } from 'crypto'

export default class GamesController {
  // Crear una nueva sala de juego
  public async createRoom({ auth, response, request }: HttpContextContract) {
    const user = auth.user!
  
    // Generar un código al azar (4 dígitos)
    const numsala = parseInt(randomBytes(2).toString('hex'), 16) % 10000
    const { width, height } = request.all()
  
    // Validación de tamaño del tablero
    if (width < 6 || width > 9 || height < 6 || height > 9) {
      return response.badRequest('El tablero debe tener un tamaño entre 6x6 y 9x9')
    }
  
    const board = Array(height).fill(0).map(() => Array(width).fill(0))
  
    const game = await Game.create({
      playerOne: user.id,
      numsala,
      width,
      height,
      board: JSON.stringify(board),
      currentTurn: user.id,
    })
  
    return response.status(201).json({
      message: 'Sala creada con éxito.',
      numsala: game.numsala,
      creator: user.username,
    });
  }

  // Unirse a una sala por código
 public async joinRoom({ request, auth, response }: HttpContextContract) {
  const { numsala } = request.only(['numsala'])
  const user = auth.user!

  const game = await Game.query()
    .where('numsala', numsala)
    .andWhereNull('playerTwo')
    .first()

  if (!game) {
    return response.status(404).json({ error: 'Sala no encontrada o ya está llena.' })
  }

  game.playerTwo = user.id
  await game.save()

  // Inicializa el tablero y otros estados del juego
  const board = Array(game.height).fill(0).map(() => Array(game.width).fill(0))
  game.board = JSON.stringify(board)
  game.currentTurn = game.playerOne // Puede ser cualquier lógica para el primer turno
  await game.save()

  // Emitir el evento por websocket
  Ws.io.emit(`game_${game.id}`, { game })

  return response.status(200).json({ message: 'Te has unido a la sala.' })
}

  // Unirse a una sala de un amigo
  public async joinRoomByFriend({ request, auth, response }: HttpContextContract) {
    const { username } = request.only(['username'])
    const user = auth.user!
    const friend = await User.findByOrFail('username', username)

    // Aquí puedes agregar lógica para verificar si `friendId` es amigo del usuario
    const game = await Game.query()
      .where('playerOne', friend.id)
      .andWhereNull('playerTwo')
      .first()

    if (!game) {
      return response.status(404).json({ error: 'Sala no encontrada o ya está llena.' })
    }

    game.playerTwo = user.id
    await game.save()

    // Emitir el evento por websocket
    Ws.io.emit(`game_${game.id}`, { game })

    return response.status(200).json({ message: 'Te has unido a la sala de tu amigo.' })
  }

  // Realizar un movimiento en el juego
  public async move({ request, auth, response }: HttpContextContract) {
    const { column } = request.all()
    const user = auth.user!

    const game = await Game.findByOrFail('id', request.input('game_id'))

    if (game.currentTurn !== user.id) {
      return response.badRequest('No es tu turno')
    }

    const board = JSON.parse(game.board || '[]')

    const row = this.placeChip(board, column, board.length)
    if (row === -1) {
      return response.badRequest('La columna está llena')
    }

    const winner = this.checkWinner(board, row, column, board[0].length, board.length)
    if (winner) {
      game.winner = user.id
      await game.save()

      Ws.io.emit(`game_${game.id}`, { game, winner: user })

      return response.ok({ message: `¡${user.name} ha ganado el juego!`, game })
    }

    game.currentTurn = game.currentTurn === game.playerOne ? game.playerTwo : game.playerOne
    game.board = JSON.stringify(board)
    await game.save()

    Ws.io.emit(`game_${game.id}`, { game })

    return response.ok({ game })
  }

  // Lógica para colocar la ficha en la columna
  private placeChip(board: number[][], column: number, height: number): number {
    for (let row = height - 1; row >= 0; row--) {
      if (board[row][column] === 0) {
        board[row][column] = 1 // Se puede mejorar para diferenciar jugadores
        return row
      }
    }
    return -1
  }

  // Verificar si hay un ganador
  private checkWinner(board: number[][], row: number, column: number, width: number, height: number): boolean {
    // Implementa la lógica de verificación aquí
    return false
  }
  public async getRoomDetails({ params, response }: HttpContextContract) {
    const { numsala } = params
  
    const game = await Game.query()
      .where('numsala', numsala)
      .preload('playerOneUser', (query) => query.select('username'))
      .preload('playerTwoUser', (query) => query.select('username'))
      .first()
  
    if (!game) {
      return response.status(404).json({ error: 'Sala no encontrada.' })
    }
  
    return response.status(200).json({ game })
  }
  public async getHistory({ auth, response }: HttpContextContract) {
    const playerId = auth.user!.id

    try {
      // Buscar partidas donde el jugador es player_one o player_two
      const games = await Game.query()
        .where('player_one', playerId)
        .orWhere('player_two', playerId)
        .preload('playerOneUser')
        .preload('playerTwoUser')
        .preload('winnerUser')

      return response.ok(games)
    } catch (error) {
      console.error('Error fetching player games:', error)
      return response.status(500).send('Internal Server Error')
    }
  }
}
