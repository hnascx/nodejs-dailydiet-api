import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

export async function usersRoutes(app: FastifyInstance) {
  // Create a new user
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
    })

    const { name } = createUserBodySchema.parse(request.body)
    const id = randomUUID()

    await knex('users').insert({
      id,
      name,
    })

    return reply.status(201).send({ id, name })
  })

  // List all users
  app.get('/', async () => {
    const users = await knex('users').select()

    return { users }
  })

  // List a specific user by id
  app.get('/:id', async (request) => {
    const getUserParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getUserParamsSchema.parse(request.params)

    const user = await knex('users').where({ id }).first()

    if (!user) {
      return { message: 'User not found' }
    }

    return { user }
  })

  // Update a specific user by id
  app.put('/:id', async (request, reply) => {
    const updateUserParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const updateUserBodySchema = z.object({
      name: z.string(),
    })

    const { id } = updateUserParamsSchema.parse(request.params)
    const { name } = updateUserBodySchema.parse(request.body)

    const updatedDataFromUser = await knex('users')
      .where({ id })
      .update({ name, updated_at: knex.fn.now() })

    if (!updatedDataFromUser) {
      return reply.status(404).send({ message: 'User not found' })
    }

    return reply.status(204).send()
  })

  // Delete a specific user by id
  app.delete('/:id', async (request, reply) => {
    const deleteUserParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = deleteUserParamsSchema.parse(request.params)

    const deletedDataFromUser = await knex('users').where({ id }).delete()

    if (!deletedDataFromUser) {
      return reply.status(404).send({ message: 'User not found' })
    }

    return reply.status(204).send()
  })
}
