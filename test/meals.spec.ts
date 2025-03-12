import { afterAll, beforeAll, describe, it, beforeEach, expect } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new meal', async () => {
    const createdUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe' })
      .expect(201)

    const userId = createdUserResponse.body.id

    const createMealResponse = await request(app.server)
      .post('/meals')
      .send({
        title: 'Test meal',
        description: 'Test description',
        isOnTheDiet: true,
      })
      .set('userId', userId)
      .expect(201)

    expect(createMealResponse.body).toHaveProperty('id')
    expect(createMealResponse.body).toHaveProperty('title')
    expect(createMealResponse.body).toHaveProperty('description')
    expect(createMealResponse.body).toHaveProperty('isOnTheDiet')
    expect(createMealResponse.body).toHaveProperty('userId')
  })

  it('should be able to list all meals', async () => {
    const createdUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe' })
      .expect(201)

    const userId = createdUserResponse.body.id

    await request(app.server)
      .post('/meals')
      .send({
        title: 'Test meal',
        description: 'Test description',
        isOnTheDiet: true,
      })
      .set('userId', userId)
      .expect(201)

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('userId', userId)
      .expect(200)

    expect(listMealsResponse.body).toHaveProperty('meals')
    expect(listMealsResponse.body.meals).toBeInstanceOf(Array)
    expect(listMealsResponse.body.meals.length).toBeGreaterThan(0)
  })

  it('should be able to get a meal by id', async () => {
    const createdUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe' })
      .expect(201)

    const userId = createdUserResponse.body.id

    const createdMealResponse = await request(app.server)
      .post('/meals')
      .send({
        title: 'Test meal',
        description: 'Test description',
        isOnTheDiet: true,
      })
      .set('userId', userId)
      .expect(201)

    const mealId = createdMealResponse.body.id

    const getMealByIdResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('userId', userId)
      .expect(200)

    expect(getMealByIdResponse.body).toHaveProperty('meal')
    expect(getMealByIdResponse.body.meal.id).toBe(mealId)
  })

  it('should be able to get the meal metrics of a user', async () => {})

  it('should be able to update a meal', async () => {
    const createdUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe' })
      .expect(201)

    const userId = createdUserResponse.body.id

    const createdMealResponse = await request(app.server)
      .post('/meals')
      .send({
        title: 'Test meal',
        description: 'Test description',
        isOnTheDiet: true,
      })
      .set('userId', userId)
      .expect(201)

    const mealId = createdMealResponse.body.id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .send({
        title: 'Updated Test meal',
        description: 'Updated Test description',
        isOnTheDiet: false,
      })
      .set('userId', userId)
      .expect(204)
  })

  it('should be able to delete a meal', async () => {
    const createdUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe' })
      .expect(201)

    const userId = createdUserResponse.body.id

    const createdMealResponse = await request(app.server)
      .post('/meals')
      .send({
        title: 'Test meal',
        description: 'Test description',
        isOnTheDiet: true,
      })
      .set('userId', userId)
      .expect(201)

    const mealId = createdMealResponse.body.id

    console.log(mealId)

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('userId', userId)
      .expect(204)
  })
})
