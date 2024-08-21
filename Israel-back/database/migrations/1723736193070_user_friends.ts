import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UserFriends extends BaseSchema {
  protected tableName = 'user_friends'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('friend_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.enu('status', ['pending', 'accepted', 'blocked']).defaultTo('pending')
      table.unique(['user_id', 'friend_id'])
      table.timestamps(true, true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}

