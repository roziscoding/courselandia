import sinon from 'sinon'
import db from '../util/db'
import env from 'sugar-env'
import { expect } from 'chai'
import axiosist from 'axiosist'
import { describe, before, it } from 'mocha'
import { config } from '../../src/app-config'
import { AxiosInstance, AxiosResponse } from 'axios'
import mongodb from '../../src/data/connections/mongodb'
import { app as appFactory } from '../../src/presentation/app'

import { auth } from '../fixtures'

const options = {
  ...config,
  auth: {
    jwt: {
      algorithms: ['HS256'],
      secret: 'mysecret',
      issuer: env.get('AUTH_JWT_AUDIENCE', 'courselandia'),
      audience: env.get('AUTH_JWT_AUDIENCE', 'courselandia')
    }
  }
}

describe('POST /signup', () => {
  let api: AxiosInstance
  let database: any

  before(async () => {
    sinon.stub(mongodb, 'createConnection').callsFake(db.prepareDatabase(connection => {
      database = connection
    }))

    api = axiosist(await appFactory(options, env.TEST))
  })

  after(async () => {
    await database.close()
    ;(mongodb.createConnection as any).restore()
  })

  afterEach(async () => {
    await database.collection('users')
      .remove({})
  })

  describe('When required parameters are missing', () => {
    let response: AxiosResponse

    before(async () => {
      response = await api.post('/signup', {})
    })

    it('should return HTTP 422', () => {
      expect(response.status).to.be.equal(422)
    })

    it('should return an error object', () => {
      expect(response.data).to.have.property('error')
    })

    it('should return a `unprocessable_entity` error code', () => {
      expect(response.data.error.code).to.be.equal('unprocessable_entity')
    })
  })

  describe('When email exists', () => {
    let response: AxiosResponse

    before(async () => {
      await database.collection('users').insert(auth.user)

      response = await api.post('/signup', { email: 'some@email.com', password: 'MyP4ssw0rd!' })
    })

    it('should return HTTP 409', () => {
      expect(response.status).to.be.equal(409)
    })

    it('should return an error object', () => {
      expect(response.data).to.have.property('error')
    })

    it('should return a `email_already_exists` error code', () => {
      expect(response.data.error.code).to.be.equal('email_already_exists')
    })
  })

  describe('When user is creted', () => {
    let response: AxiosResponse

    before(async () => {
      response = await api.post('/signup', { email: 'my@email.com', password: 'MyP4ssw0rd!' })
    })

    it('should return HTTP 201', () => {
      expect(response.status).to.be.equal(201)
    })

    it('should return an object', () => {
      expect(response.data).to.be.an('object')
    })

    it('should return an id', () => {
      expect(response.data).to.have.property('id')
    })
  })
})
