import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import axios from 'axios'
export default class Recaptcha {
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    const token = request.input('token')

    if (!token) {
      return response.badRequest('reCAPTCHA token is required')
    }

    const secretKey = '6Lf7UQIqAAAAAAv1tTcXje0OfZZhYnp6uQL8eMNI'
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`
    console.log(token)
    try {
      const { data } = await axios.post(url)
      if (!data.success) {
        return response.unauthorized('Invalid reCAPTCHA token')
      }
    } catch (error) {
      console.error('Error validating reCAPTCHA token:', error)
      return response.internalServerError('Error validating reCAPTCHA token')
    }

    await next()
  }
}
