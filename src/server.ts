import fastify from 'fastify'

const app = fastify()

app.get('/meals', () => {
  return 'Daily Diet API'
})

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('HTTP Server Running! 🚀')
  })
