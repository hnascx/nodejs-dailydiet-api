import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { verifyUser } from '../middlewares/verify-user'

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: verifyUser }, async (request, reply) => {
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

  app.get('/', { preHandler: verifyUser }, async (request) => {
    const userId = request.user.id

    const meals = (await knex('meals').where('user_id', userId).select()).map(
      (meal) => ({
        ...meal,
        is_on_the_diet: Boolean(meal.is_on_the_diet), // Convert to boolean
      }),
    )

    return { meals }
  })

  app.get('/:id', { preHandler: verifyUser }, async (request, reply) => {
    const getMealByIdParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealByIdParamsSchema.parse(request.params)

    const userId = request.user.id

    const meal = await knex('meals')
      .where('user_id', userId)
      .where('id', id)
      .first()

    if (!meal) {
      return reply
        .status(404)
        .send({ message: 'Meal not found or not authorized' })
    }

    return {
      meal: {
        ...meal,
        is_on_the_diet: Boolean(meal.is_on_the_diet),
      },
    }
  })

  app.put('/:id', { preHandler: verifyUser }, async (request, reply) => {
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

    const existingMeal = await knex('meals')
      .where('user_id', userId)
      .where('id', id)
      .first()

    if (!existingMeal) {
      return reply
        .status(404)
        .send({ message: 'Meal not found or not authorized' })
    }

    await knex('meals')
      .where('user_id', userId)
      .where('id', id)
      .update({
        title: title ?? existingMeal.title,
        description: description ?? existingMeal.description,
        updated_at: knex.fn.now(),
      })

    return reply.status(204).send()
  })

  app.patch(
    '/:id/is-on-the-diet',
    { preHandler: verifyUser },
    async (request, reply) => {
      const isMealOnTheDietParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = isMealOnTheDietParamsSchema.parse(request.params)
      const userId = request.user.id

      const meal = await knex('meals')
        .where('user_id', userId)
        .where('id', id)
        .select('is_on_the_diet')
        .first()

      if (!meal) {
        return reply
          .status(404)
          .send({ message: 'Meal not found or not authorized' })
      }

      const newStatusToIsOnTheDiet = !meal.is_on_the_diet

      await knex('meals').where('user_id', userId).where('id', id).update({
        is_on_the_diet: newStatusToIsOnTheDiet,
        updated_at: knex.fn.now(),
      })

      return reply.status(204).send()
    },
  )

  app.delete('/:id', { preHandler: verifyUser }, async (request, reply) => {
    const deleteMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = deleteMealParamsSchema.parse(request.params)
    const userId = request.user.id

    const mealToDelete = await knex('meals')
      .where('user_id', userId)
      .where('id', id)
      .del()

    if (!mealToDelete) {
      return reply
        .status(404)
        .send({ message: 'Meal not found or not authorized' })
    }

    return reply.status(204).send()
  })
}
