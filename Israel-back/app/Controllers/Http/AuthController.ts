import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class AuthController {

    public async register({ request, response }: HttpContextContract) {

        const { email, password, username, name, lastname} = request.all()
        const user = await User.create({ name, lastname, email, password, username})

        return response.json({ user })
    }

    public async login({ request, auth, response }: HttpContextContract){
        const { userId, password } = request.all()

        try {
            const token = await auth.use('api').attempt(userId, password)
            const user = auth.user;
            return response.ok({ token, user });
        }
        catch {
            return response.badRequest('Invalid user or password')
        }
    }

    public async index({ response }: HttpContextContract){
        const users = await User.all()

        return response.json(users)
    }
}
