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

  app.get('/metrics', { preHandler: verifyUser }, async (request) => {
    const userId = request.user.id

    // All meals from the user ordered by created_at
    const meals = await knex('meals')
      .where('user_id', userId)
      .orderBy('created_at', 'asc')
      .select()

    // Convertion to boolean after query be solved
    const formattedMeals = meals.map((meal) => ({
      ...meal,
      is_on_the_diet: Boolean(meal.is_on_the_diet),
    }))

    // Calculate the metrics
    const totalMeals = formattedMeals.length
    const mealsOnDiet = formattedMeals.filter(
      (meal) => meal.is_on_the_diet,
    ).length // Returns an array with the meals on the diet where is_on_the_diet is true
    const mealsOffDiet = totalMeals - mealsOnDiet

    // Calculate the best sequence of meals on the diet
    let bestStreak = 0
    let currentStreak = 0

    for (const meal of meals) {
      if (meal.is_on_the_diet) {
        currentStreak++
        bestStreak = Math.max(bestStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    }

    return {
      totalMeals,
      mealsOnDiet,
      mealsOffDiet,
      bestStreak,
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
