import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

// Hoe een film eruit ziet + validatie van 3 velden
export const filmSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    titel: Type.String({ minLength: 2, maxLength: 100 }),
    jaar: Type.Integer({ minimum: 1900, maximum: 2030 }),
    score: Type.Integer({ minimum: 1, maximum: 10 }),
    userId: Type.String({ objectid: true })
  },
  { $id: 'Film', additionalProperties: false }
)
export const filmValidator = getValidator(filmSchema, dataValidator)
export const filmResolver = resolve({})

export const filmExternalResolver = resolve({})

// Bij create: alleen titel, jaar en score meesturen
export const filmDataSchema = Type.Pick(filmSchema, ['titel', 'jaar', 'score'], {
  $id: 'FilmData'
})
export const filmDataValidator = getValidator(filmDataSchema, dataValidator)
export const filmDataResolver = resolve({
  // userId komt van de ingelogde user
  userId: async function (value, film, context) {
    return context.params.user._id
  }
})

// Bij patch: dezelfde velden, maar niet verplicht
export const filmPatchSchema = Type.Partial(Type.Pick(filmSchema, ['titel', 'jaar', 'score']), {
  $id: 'FilmPatch'
})
export const filmPatchValidator = getValidator(filmPatchSchema, dataValidator)
export const filmPatchResolver = resolve({})

// Op welke velden je mag zoeken
export const filmQueryProperties = Type.Pick(filmSchema, ['_id', 'titel', 'jaar', 'score', 'userId'])
export const filmQuerySchema = Type.Intersect(
  [
    querySyntax(filmQueryProperties),
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const filmQueryValidator = getValidator(filmQuerySchema, queryValidator)
export const filmQueryResolver = resolve({
  // een user ziet alleen zijn eigen films
  userId: async function (value, query, context) {
    if (context.params.user) {
      return context.params.user._id
    }
    return value
  }
})
