import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Adress from 'App/Models/Adress'
import User from 'App/Models/User'

export default class AdressesController {

    public async store({ auth, request, response }: HttpContextContract){
        const { street, suburb, city, country, zip_code, latitude, longitude } = request.all()
        const user = await auth.user

        if(!user){
            return response.unauthorized({ error: 'Unauthorized' })
        }
        
        const user_id = user?.id
        const adress = await Adress.create({ street, suburb, city, country, zip_code, latitude, longitude, user_id })

        return response.json({ adress })
    }

    public async showAdressesByUser({ auth, response }: HttpContextContract){
        const user = await auth.user
        const adresses = await user?.related('adresses').query()

        return response.json(adresses)
    }

    public async index({ response }: HttpContextContract){
        //Cargar todos los usuarios con sus direcciones
        const users = await User.query().preload('adresses')
        return response.json(users)
    }
}
