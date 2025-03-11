import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'

export async function verifyUser(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.headers.userid // fastify is case sensitive, so theu serId that come from header should be transformed to lowercase

  if (!userId || typeof userId !== 'string') {
    return reply.status(401).send({ message: 'Unauthorized' })
  }

  const user = await knex('users').where('id', userId).first()

  if (!user) {
    return reply.status(404).send({ message: 'User not found' })
  }

  request.user = { id: userId }
}
