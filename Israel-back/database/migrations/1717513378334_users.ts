import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name', 255).notNullable()
      table.string('lastname', 255).notNullable()
      table.integer('active').defaultTo(1)
      table.string('email', 255).notNullable().unique()
      table.string('username', 255).unique()
      table.string('password', 180).notNullable()
      table.string('remember_me_token').nullable()
      table.integer('played_games').defaultTo(0)
      table.integer('won_games').defaultTo(0)
      table.integer('lost_games').defaultTo(0)
      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
