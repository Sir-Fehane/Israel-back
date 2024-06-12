import User from 'App/Models/User'
import { BaseModel, belongsTo, column, BelongsTo } from '@ioc:Adonis/Lucid/Orm'

export default class Adress extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public street: string

  @column()
  public suburb: string

  @column()
  public city: string

  @column()
  public country: string

  @column()
  public zip_code: string

  @column()
  public latitude: number

  @column()
  public longitude: number

  @column()
  public user_id: number

  @belongsTo(() => User, {
    foreignKey: 'user_id',
  })
  public user: BelongsTo<typeof User>
  
}
