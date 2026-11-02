export const filmPath = 'films'

export const filmMethods = ['find', 'get', 'create', 'patch', 'remove']

export const filmClient = client => {
  const connection = client.get('connection')

  client.use(filmPath, connection.service(filmPath), {
    methods: filmMethods
  })
}
