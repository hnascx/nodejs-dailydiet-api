import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Users routes', () => {
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

  it('should be able to create a new user', async () => {
    const createdUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe' })
      .expect(201)

    expect(createdUserResponse.body).toHaveProperty('id')
    expect(createdUserResponse.body).toHaveProperty('name')
  })

  it('should be able to list all users', async () => {
    await request(app.server)
      .post('/users')
      .send({ name: 'John Doe' })
      .expect(201)

    const listUserResponse = await request(app.server).get('/users').expect(200)

    expect(listUserResponse.body).toHaveProperty('users')
    expect(listUserResponse.body.users).toBeInstanceOf(Array)
    expect(listUserResponse.body.users.length).toBeGreaterThan(0)
  })

  it('should be able to get a user by id', async () => {
    const createdUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe' })
      .expect(201)

    const userId = createdUserResponse.body.id

    const listUserById = await request(app.server)
      .get(`/users/${userId}`)
      .expect(200)

    expect(listUserById.body).toHaveProperty('user')
    expect(listUserById.body.user.id).toBe(userId)
    expect(listUserById.body.user.name).toBe('John Doe')
  })

  it('should be able to update a user', async () => {
    const createdUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe' })
      .expect(201)

    const userId = createdUserResponse.body.id

    await request(app.server)
      .put(`/users/${userId}`)
      .send({ name: 'John Smith' })
      .expect(204)

    const checkIfUserWasUpdatedResponse = await request(app.server)
      .get(`/users/${userId}`)
      .expect(200)

    expect(checkIfUserWasUpdatedResponse.body.user.name).toBe('John Smith')
  })

  it('should be able to delete a user', async () => {
    const createdUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe' })
      .expect(201)

    const userId = createdUserResponse.body.id

    await request(app.server).delete(`/users/${userId}`).expect(204)

    const checkIfUserWasDeletedResponse = await request(app.server)
      .get(`/users/${userId}`)
      .expect(200)

    expect(checkIfUserWasDeletedResponse.body).toHaveProperty(
      'message',
      'User not found',
    )
  })
})
