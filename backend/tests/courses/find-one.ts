import sinon from 'sinon'
import db from '../util/db'
import env from 'sugar-env'
import { expect } from 'chai'
import axiosist from 'axiosist'
import { ObjectId } from 'mongodb'
import { describe, before, it } from 'mocha'
import { config } from '../../src/app-config'
import { AxiosInstance, AxiosResponse } from 'axios'
import mongodb from '../../src/data/connections/mongodb'
import { app as appFactory } from '../../src/presentation/app'

import { courses } from '../fixtures'

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

describe('GET /courses/5cfbadda11bfb51242cc630c', () => {
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
    await database.collection('courses')
      .remove({})
  })

  describe('When course exists', () => {
    let response: AxiosResponse<any>

    before(async () => {
      await database.collection('courses')
        .insert({ ...courses.noIdCourse, _id: new ObjectId('5cfbadda11bfb51242cc630c') })

      response = await api.get('/courses/5cfbadda11bfb51242cc630c')
    })

    it('should return HTTP 200', () => {
      expect(response.status).to.be.equal(200)
    })

    it('should return an object', () => {
      expect(response.data).to.be.an('object')
    })
  })

  describe('When course does not exist', () => {
    let response: AxiosResponse<any>

    before(async () => {
      response = await api.get('/courses/5cfbadda11bfb51242cc630c')
    })

    it('should return HTTP 404', () => {
      expect(response.status).to.be.equal(404)
    })

    it('should return an error object', () => {
      expect(response.data).to.have.property('error')
    })

    it('should have a `not_found` error code', () => {
      expect(response.data.error.code).to.be.equal('not_found')
    })
  })
})
