import assert from 'assert'
import { app } from '../../../src/app.js'

describe('films service', function () {
  let jan
  let piet
  let film

  // voor de testen: 2 users aanmaken
  before(async function () {
    jan = await app.service('users').create({ email: 'jan@test.be', password: 'jan123' })
    piet = await app.service('users').create({ email: 'piet@test.be', password: 'piet123' })
  })

  // na de testen: users opruimen (de film is al verwijderd in de laatste test)
  after(async function () {
    await app.service('users').remove(jan._id)
    await app.service('users').remove(piet._id)
  })

  it('registered the service', function () {
    const service = app.service('films')
    assert.ok(service, 'Registered the service')
  })

  it('maakt een film aan met userId van de ingelogde user', async function () {
    film = await app.service('films').create({ titel: 'Inception', jaar: 2010, score: 9 }, { user: jan })

    assert.strictEqual(film.titel, 'Inception')
    assert.strictEqual(film.jaar, 2010)
    assert.strictEqual(film.score, 9)
    assert.strictEqual(film.userId.toString(), jan._id.toString())
  })

  it('geeft een fout bij een te korte titel', async function () {
    try {
      await app.service('films').create({ titel: 'X', jaar: 2010, score: 9 }, { user: jan })
      assert.fail('mag hier niet komen')
    } catch (error) {
      assert.strictEqual(error.name, 'BadRequest')
    }
  })

  it('geeft een fout bij een fout jaar', async function () {
    try {
      await app.service('films').create({ titel: 'Oud', jaar: 1800, score: 9 }, { user: jan })
      assert.fail('mag hier niet komen')
    } catch (error) {
      assert.strictEqual(error.name, 'BadRequest')
    }
  })

  it('geeft een fout bij een score boven 10', async function () {
    try {
      await app.service('films').create({ titel: 'Te goed', jaar: 2010, score: 11 }, { user: jan })
      assert.fail('mag hier niet komen')
    } catch (error) {
      assert.strictEqual(error.name, 'BadRequest')
    }
  })

  it('geeft 401 zonder token', async function () {
    try {
      await app.service('films').find({ provider: 'rest' })
      assert.fail('mag hier niet komen')
    } catch (error) {
      assert.strictEqual(error.name, 'NotAuthenticated')
    }
  })

  it('toont enkel de eigen films', async function () {
    const resultJan = await app.service('films').find({ user: jan })
    const resultPiet = await app.service('films').find({ user: piet })

    assert.strictEqual(resultJan.total, 1)
    assert.strictEqual(resultPiet.total, 0)
  })

  it('haalt een film op met id', async function () {
    const gevonden = await app.service('films').get(film._id, { user: jan })
    assert.strictEqual(gevonden.titel, 'Inception')
  })

  it('een andere user kan de film niet ophalen', async function () {
    try {
      await app.service('films').get(film._id, { user: piet })
      assert.fail('mag hier niet komen')
    } catch (error) {
      assert.strictEqual(error.name, 'NotFound')
    }
  })

  it('past de score aan', async function () {
    const aangepast = await app.service('films').patch(film._id, { score: 8 }, { user: jan })
    assert.strictEqual(aangepast.score, 8)
  })

  it('verwijdert de film', async function () {
    await app.service('films').remove(film._id, { user: jan })
    const result = await app.service('films').find({ user: jan })
    assert.strictEqual(result.total, 0)
  })
})
