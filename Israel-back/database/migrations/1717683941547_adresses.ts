import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'adresses'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').references('id').inTable('users')
      table.string('street', 255).notNullable()
      table.string('suburb', 255).notNullable()
      table.string('city',255).notNullable()
      table.string('country',255).notNullable()
      table.string('zip_code',5).notNullable()
      table.double('latitude').notNullable()
      table.double('longitude').notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
