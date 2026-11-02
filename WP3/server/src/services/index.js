import { film } from './films/films.js'
import { user } from './users/users.js'
export const services = app => {
  app.configure(film)

  app.configure(user)

  // All services will be registered here
}
