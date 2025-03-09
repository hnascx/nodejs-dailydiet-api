import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createMealBodySchema = z.object({
      title: z.string(),
      description: z.string(),
      isOnTheDiet: z.boolean().default(false),
    })

    const { title, description, isOnTheDiet } = createMealBodySchema.parse(
      request.body,
    )

    const userId = request.user.id

    await knex('meals').insert({
      id: randomUUID(),
      title,
      description,
      is_on_the_diet: isOnTheDiet,
      user_id: userId,
    })

    return reply.status(201).send()
  })

  app.get('/', async (request) => {
    const userId = request.user.id

    const meals = await knex('meals').where('user_id', userId).select()

    return { meals }
  })

  app.get('/:id', async (request, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    const userId = request.user.id

    const meal = await knex('meals')
      .where('user_id', userId)
      .where('id', id)
      .first()

    if (!meal) {
      return reply.status(404).send({ message: 'Meal not found' })
    }

    return { meal }
  })

  app.put('/:id', async (request, reply) => {
    const updateMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const updateMealBodySchema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
    })

    const { id } = updateMealParamsSchema.parse(request.params)
    const { title, description } = updateMealBodySchema.parse(request.body)

    const userId = request.user.id

    const meal = await knex('meals')
      .where('user_id', userId)
      .where('id', id)
      .first()

    if (!meal) {
      return reply.status(404).send({ message: 'Meal not found' })
    }

    await knex('meals')
      .where('user_id', userId)
      .where('id', id)
      .update({
        title: title ?? meal.title,
        description: description ?? meal.description,
        updated_at: knex.fn.now(),
      })
  })
}
