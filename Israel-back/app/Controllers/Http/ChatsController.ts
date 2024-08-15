import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Ws from 'App/Services/Ws'

export default class ChatController {
  public async index({ response }: HttpContextContract) {
    return response.json({ message: 'Chat server is running' })
  }

  public async sendMessage({ request, response }: HttpContextContract) {
    const { username, message } = request.all()
    Ws.io.emit('message', { username, text: message })
    return response.json({ success: true })
  }
}