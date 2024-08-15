import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Game from 'App/Models/Game'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public lastname: string

  @column()
  public email: string

  @column()
  public username: string


  @column({ serializeAs: null })
  public password: string

  @column()
  public rememberMeToken: string | null


  @column()
  public playedGames: number

  @column()
  public wonGames: number

  @column()
  public lostGames: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  @manyToMany(() => User, {
    pivotTable: 'user_friends',
    pivotForeignKey: 'user_id',
    pivotRelatedForeignKey: 'friend_id',
  })
  public friends: ManyToMany<typeof User>

  @manyToMany(() => Game)
  public games: ManyToMany<typeof Game>
}
