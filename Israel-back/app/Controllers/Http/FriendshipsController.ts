import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class FriendsController {
  // Añadir un amigo por username
  public async addFriend({ request, auth, response }: HttpContextContract) {
    const friendUsername = request.input('username')
    const user = auth.user!

    try {
      const friend = await User.findByOrFail('username', friendUsername)

      await user.related('friends').attach({
        [friend.id]: {
          status: 'pending',
        },
      })
      return response.status(200).json({ message: 'Friend request sent.' })
    } catch (error) {
      return response.status(404).json({ error: 'User not found.' })
    }
  }

  // Aceptar solicitud de amistad por username
  public async acceptFriend({ request, auth, response }: HttpContextContract) {
    const friendUsername = request.input('username')
    const user = auth.user!

    try {
      const friend = await User.findByOrFail('username', friendUsername)

      await user.related('friends')
        .query()
        .wherePivot('friend_id', friend.id)
        .wherePivot('status', 'pending')
        .update({ status: 'accepted' })

      return response.status(200).json({ message: 'Friend request accepted.' })
    } catch (error) {
      return response.status(404).json({ error: 'User not found or request not pending.' })
    }
  }

  // Bloquear a un amigo por username
  public async blockFriend({ request, auth, response }: HttpContextContract) {
    const friendUsername = request.input('username')
    const user = auth.user!

    try {
      const friend = await User.findByOrFail('username', friendUsername)

      await user.related('friends')
        .query()
        .wherePivot('friend_id', friend.id)
        .update({ status: 'blocked' })

      return response.status(200).json({ message: 'Friend blocked.' })
    } catch (error) {
      return response.status(404).json({ error: 'User not found or unable to block.' })
    }
  }

  // Listar amigos
  public async listFriends({ auth, response }: HttpContextContract) {
    const user = auth.user!

    try {
      const friends = await user.related('friends')
        .query()
        .select('users.username') // Seleccionar el campo username de la tabla users
        .pivotColumns(['status']) // Incluir el campo status desde la tabla pivote

      // Mapeo de los amigos para incluir el estado desde el pivote
      const friendList = friends.map(friend => ({
        username: friend.username,
        status: friend.$extras.pivot_status // Acceder al status desde $extras usando pivot_
      }))

      return response.status(200).json(friendList)
    } catch (error) {
      console.error('Error fetching friends:', error)
      return response.status(500).json({ error: 'Unable to fetch friends.' })
    }
  }
}
