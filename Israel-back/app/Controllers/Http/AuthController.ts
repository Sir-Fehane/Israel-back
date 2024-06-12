import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Role from 'App/Models/Role'
import User from 'App/Models/User'

export default class AuthController {

    public async register({ request, response }: HttpContextContract) {

        const { email, password, username, phone , birthdate, name, lastname, age} = request.all()
        const role = await Role.findByOrFail('slug', 'support')
        const user = await User.create({ name, lastname, age, birthdate, email, password, username, phone, roleId: role.id})

        return response.json({ user })
    }

    public async login({ request, auth, response }: HttpContextContract){
        const { userId, password } = request.all()

        try {
            const token = await auth.use('api').attempt(userId, password)
            return response.json({ token })
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
