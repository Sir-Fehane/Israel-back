import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Game from 'App/Models/Game'
import { randomBytes } from 'crypto'

export default class GamesController {
  public async createRoom({ auth, response }: HttpContextContract) {
    const user = auth.user!

    // Generar un código al azar (4 dígitos)
    const numsala = parseInt(randomBytes(2).toString('hex'), 16) % 10000

    const game = await Game.create({
      playerOne: user.id,
      numsala,
    })

    return response.status(201).json({
      message: 'Sala creada con éxito.',
      numsala: game.numsala,
    })
  }

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

    return response.status(200).json({ message: 'Te has unido a la sala.' })
  }

  public async joinRoomByFriend({ request, auth, response }: HttpContextContract) {
    const { friendId } = request.only(['friendId'])
    const user = auth.user!

    // Aquí puedes agregar lógica para verificar si `friendId` es amigo del usuario
    const game = await Game.query()
      .where('playerOne', friendId)
      .andWhereNull('playerTwo')
      .first()

    if (!game) {
      return response.status(404).json({ error: 'Sala no encontrada o ya está llena.' })
    }

    game.playerTwo = user.id
    await game.save()

    return response.status(200).json({ message: 'Te has unido a la sala de tu amigo.' })
  }
}
