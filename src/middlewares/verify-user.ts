import { FastifyReply, FastifyRequest } from 'fastify'

export async function verifyUser(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.headers['user-id'] // Simulating the user identification via header

  if (!userId || typeof userId !== 'string') {
    return reply.status(401).send({ message: 'Unauthorized' })
  }

  request.user = { id: userId }
}
