import 'dotenv/config'
import { Knex, knex as setupKnex } from 'knex'

if (!process.env.DATABASE_URL) {
  throw new Error('Env var DATABASE_URL is missing')
}

export const config: Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: process.env.DATABASE_URL,
  },

  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}

export const knex = setupKnex(config)
