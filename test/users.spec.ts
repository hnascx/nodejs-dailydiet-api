import { it, beforeAll, afterAll, describe, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

describe('Users routes', () => {
  let userId: string

  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a new user', async () => {
    const response = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe' })
      .expect(201)

    expect(response.body).toHaveProperty('id')
    userId = response.body.id
  })

  it('should be able to list all users', async () => {
    const response = await request(app.server).get('/users').expect(200)

    expect(response.body).toHaveProperty('users')
    expect(response.body.users).toBeInstanceOf(Array)
    expect(response.body.users.length).toBeGreaterThan(0)
  })

  it('should be able to get a user by id', async () => {
    const response = await request(app.server)
      .get(`/users/${userId}`)
      .expect(200)

    expect(response.body).toHaveProperty('user')
    expect(response.body.user.id).toBe(userId)
    expect(response.body.user.name).toBe('John Doe')
  })

  it('should be able to update a user', async () => {
    await request(app.server)
      .put(`/users/${userId}`)
      .send({ name: 'John Smith' })
      .expect(204)

    const updatedUserResponse = await request(app.server)
      .get(`/users/${userId}`)
      .expect(200)

    expect(updatedUserResponse.body.user.name).toBe('John Smith')
  })

  it('should be able to delete a user', async () => {
    await request(app.server).delete(`/users/${userId}`).expect(204)

    const response = await request(app.server)
      .get(`/users/${userId}`)
      .expect(200)

    expect(response.body).toHaveProperty('message', 'User not found')
  })
})
