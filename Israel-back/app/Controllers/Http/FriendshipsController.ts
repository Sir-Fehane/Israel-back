import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class FriendsController {
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

  public async listFriends({ auth, response }: HttpContextContract) {
    const user = auth.user!

    try {
      const sentRequests = await user.related('friends')
        .query()
        .select('users.username')
        .pivotColumns(['status'])

      const receivedRequests = await User.query()
        .whereHas('friends', (query) => {
          query.where('user_friends.friend_id', user.id)
        })
        .select('username', 'id')
        .preload('friends', (friendQuery) => {
          friendQuery.where('user_id', user.id).pivotColumns(['status'])
        })

      const sentMapped = sentRequests.map(friend => ({
        username: friend.username,
        status: friend.$extras.pivot_status
      }))

      const receivedMapped = receivedRequests.flatMap(friend => 
        friend.friends.map(f => ({
          username: friend.username,
          status: f.$extras.pivot_status
        }))
      )

      const friendsList = [...sentMapped, ...receivedMapped]

      return response.status(200).json(friendsList)
    } catch (error) {
      console.error('Error fetching friends:', error)
      return response.status(500).json({ error: 'Unable to fetch friends.' })
    }
  }
}
