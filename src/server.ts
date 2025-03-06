import fastify from 'fastify'
import crypto from 'node:crypto'
import { knex } from './database'

const app = fastify()

app.get('/users', async () => {
  const users = await knex('users').where('name', 'Diego').select('*')

  return users
})

app.get('/meals', async () => {
  const tables = await knex('sqlite_schema').select('*')

  return tables
})

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('HTTP Server Running! 🚀')
  })
