import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RoleMiddleware {
  public async handle({auth, response}: HttpContextContract, next: () => Promise<void>,roles:string) {
    try {
      await auth.check()
    }
    catch (error) {
      return response.unauthorized({message: 'You must be logged in to perform this action'})
    }

    const user = auth.user!

    if(!user) {
      return response.unauthorized({message: 'You must be logged in to perform this action'}) 
    }

    await user.load('role')

    console.log(user.toJSON())

    if (!roles.includes(user.role.slug)){
      return response.unauthorized({message: 'You do not have permission to perform this action'})
    }
    
    await next()
  }
}
