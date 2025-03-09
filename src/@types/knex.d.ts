// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      created_at: string
    }

    meals: {
      id: string
      title: string
      description: string
      created_at: string
      is_on_the_diet: boolean
    }
  }
}
