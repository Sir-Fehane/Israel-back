import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'games'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('player_one').unsigned().references('id').inTable('users')
      table.integer('player_two').unsigned().references('id').inTable('users')
      table.integer('winner').unsigned().references('id').inTable('users')
      table.integer('numsala').unsigned()
      table.integer('width').unsigned()
      table.integer('height').unsigned()
      table.string('board').unsigned()
      table.integer('current_turn').unsigned()
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
