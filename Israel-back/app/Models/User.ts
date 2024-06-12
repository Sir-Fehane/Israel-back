import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel, belongsTo } from '@ioc:Adonis/Lucid/Orm'
import { BelongsTo, hasMany, HasMany  } from '@ioc:Adonis/Lucid/Orm'
import Role from 'App/Models/Role'
import Adress from 'App/Models/Adress'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public lastname: string

  @column()
  public age: number

  @column()
  public birthdate: Date

  @column()
  public active: number

  @column()
  public email: string

  @column()
  public username: string

  @column()
  public phone: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public rememberMeToken: string | null

  @column()
  public roleId: number

  @belongsTo(() => Role)
  public role: BelongsTo<typeof Role>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Adress, {
    foreignKey: 'user_id', // Especifica la clave foránea
  })
  public adresses: HasMany<typeof Adress>

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
