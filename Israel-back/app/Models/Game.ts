import { DateTime } from 'luxon'
import { BaseModel, column, BelongsTo, belongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'

export default class Game extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public playerOne: number

  @column()
  public playerTwo: number

  @column()
  public winner: number

  @column()
  public numsala: number

  @column()
  public width: number

  @column()
  public height: number

  @column()
  public board: string

  @column()
  public currentTurn: number

  @belongsTo(() => User, {
    foreignKey: 'playerOne',
  })
  public playerOneUser: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'playerTwo',
  })
  public playerTwoUser: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'winner',
  })
  public winnerUser: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}

