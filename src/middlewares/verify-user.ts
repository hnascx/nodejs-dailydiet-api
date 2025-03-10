import { FastifyReply, FastifyRequest } from 'fastify'

export async function verifyUser(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.headers.userid // fastify is case sensitive, so theu serId that come from header should be transformed to lowercase

  if (!userId || typeof userId !== 'string') {
    return reply.status(401).send({ message: 'Unauthorized' })
  }

  request.user = { id: userId }
}
