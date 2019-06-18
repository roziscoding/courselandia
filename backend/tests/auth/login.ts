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

import { auth } from '../fixtures'
import { ObjectId } from 'bson';

describe('POST /login', () => {
  let api: AxiosInstance
  let database: any

  before(async () => {
    sinon.stub(mongodb, 'createConnection').callsFake(db.prepareDatabase(connection => {
      database = connection
    }))

    api = axiosist(await appFactory(options, env.TEST))
  })

  after(async () => {
    database.close()
    ;(mongodb.createConnection as any).restore()
  })

  afterEach(async () => {
    await database.collection('users')
      .remove({})
  })

  describe('When required parameters are missing', () => {
    let response: AxiosResponse

    before(async () => {
      response = await api.post('/login', {})
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

  describe('When email and password are incorrect', () => {
    let response: AxiosResponse

    before(async () => {
      await database.collection('users')
        .insert(auth.user)

      response = await api.post('/login', { email: 'some@email.com', password: 'wrong' })
    })

    it('should return HTTP 401', () => {
      expect(response.status).to.be.equal(401)
    })

    it('should return an error object', () => {
      expect(response.data).to.have.property('error')
    })

    it('should return an `unauthorized` error code', () => {
      expect(response.data.error.code).to.be.equal('unauthorized')
    })
  })

  describe('When email and password are correct', () => {
    let response: AxiosResponse

    before(async () => {
      const user = (({ _id, ...user }) => ({ _id: new ObjectId(_id), ...user }))(auth.user)

      await database.collection('users')
        .insert(user)

      response = await api.post('/login', { email: 'some@email.com', password: 'correct' })
    })

    it('should return HTTP 200', () => {
      expect(response.status).to.be.equals(200)
    })

    it('should return a token', () => {
      expect(response.data).to.have.property('token')
    })
  })
})
