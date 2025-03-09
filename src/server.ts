import fastify from 'fastify'
import { env } from './env'
import { usersRoutes } from './routes/users'
import { mealsRoutes } from './routes/meals'
import { verifyUser } from './middlewares/verify-user'

const app = fastify()

app.register(usersRoutes, {
  prefix: '/users',
})

app.register(mealsRoutes, {
  prefix: '/meals',
  hooks: {
    preHandler: verifyUser,
  },
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running! 🚀')
  })
