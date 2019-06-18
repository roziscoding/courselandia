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
      issuer: 'courselandia',
      audience: 'courselandia'
    }
  }
}

describe('POST /student/5cfb8fb6f83a345fc0b6a960/courses', () => {
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
    await database.collection('students')
      .remove({})
  })

  describe('When authorization fails', () => {
    let response: AxiosResponse<any>

    before(async () => {
      const payload = { courseId: '5cfb93906462ee65f27b4ad8' }
      const headers = { Authorization: `Bearer ${auth.invalidToken}` }
      response = await api.post('/student/5cfb8fb6f83a345fc0b6a960/courses', payload, { headers })
    })

    it('should return HTTP 401', () => {
      expect(response.status).to.be.equal(401)
    })

    it('should return an error object', () => {
      expect(response.data).to.have.property('error')
    })

    it('should return a `unauthorized` error code', () => {
      expect(response.data.error.code).to.be.equal('unauthorized')
    })
  })

  describe('When required parameters are missing', () => {
    let response: AxiosResponse<any>

    before(async () => {
      const headers = { Authorization: `Bearer ${auth.validToken}` }
      response = await api.post('/student/5cfb8fb6f83a345fc0b6a960/courses', {}, { headers })
    })

    it('should return HTTP 402', () => {
      expect(response.status).to.be.equal(402)
    })

    it('should return an error object', () => {
      expect(response.data).to.have.property('error')
    })

    it('should return a `unprocessable_entity` error code', () => {
      expect(response.data.error.code).to.be.equal('unprocessable_entity')
    })
  })

  describe('When required parameters are present', () => {
    let response: AxiosResponse<any>

    before(async () => {
      const payload = { courseId: '5cfb93906462ee65f27b4ad8' }
      const headers = { Authorization: `Bearer ${auth.validToken}` }
      response = await api.post('/student/5cfb8fb6f83a345fc0b6a960/courses', payload, { headers })
    })

    it('should return HTTP 201', () => {
      expect(response.status).to.be.equal(201)
    })
  })
})
