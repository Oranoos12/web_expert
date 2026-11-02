// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  filmDataValidator,
  filmPatchValidator,
  filmQueryValidator,
  filmResolver,
  filmExternalResolver,
  filmDataResolver,
  filmPatchResolver,
  filmQueryResolver
} from './films.schema.js'
import { FilmService, getOptions } from './films.class.js'
import { filmPath, filmMethods } from './films.shared.js'

export * from './films.class.js'
export * from './films.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const film = app => {
  // Register our service on the Feathers application
  app.use(filmPath, new FilmService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: filmMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(filmPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(filmExternalResolver),
        schemaHooks.resolveResult(filmResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(filmQueryValidator), schemaHooks.resolveQuery(filmQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(filmDataValidator), schemaHooks.resolveData(filmDataResolver)],
      patch: [schemaHooks.validateData(filmPatchValidator), schemaHooks.resolveData(filmPatchResolver)],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}
