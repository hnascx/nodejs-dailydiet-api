import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.text('title').notNullable()
    table.text('description').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    table.boolean('is_on_the_diet').defaultTo(false).notNullable()

    // Foreign key reference
    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .index()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
