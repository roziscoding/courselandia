import sinon from 'sinon'
import env from 'sugar-env'
import db from '../util/db'
import { expect } from 'chai'
import axiosist from 'axiosist'
import { config } from '../../src/app-config'
import { AxiosInstance, AxiosResponse } from 'axios'
import mongodb from '../../src/data/connections/mongodb'
import { describe, it, before, after, afterEach } from 'mocha'
import { app as appFactory } from '../../src/presentation/app'

import { ObjectId } from 'bson'
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

const getNewCourse = () => ({ _id: new ObjectId(), ...courses.noIdCourse })

describe('GET /courses?page=0&size=10', () => {
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

  describe('When results are less than page size', () => {
    let response: AxiosResponse<any>

    before(async () => {
      await database.collection('courses')
        .insert(courses.course)

      response = await api.get('/courses?page=0&size=10')
    })

    it('should return HTTP 200', () => {
      expect(response.status).to.be.equal(200)
    })

    it('should return an array', () => {
      expect(response.data).to.be.an('array')
    })
  })

  describe('When results are more than page size', () => {
    let response: AxiosResponse<any>

    before(async () => {
      const coursesToInsert = Array(11).fill(0).map(getNewCourse)

      await database.collection('courses')
        .insert(coursesToInsert)

      response = await api.get('/courses?page=0&size=10')
    })

    it('should return HTTP 206', () => {
      expect(response.status).to.be.equal(206)
    })

    it('should have a pagination header', () => {
      expect(response.headers).to.have.property('x-content-range')
    })

    describe('the pagination header', () => {
      it('should contain a valid range', () => {
        expect(response.headers['x-content-range']).to.match(/results \d+-\d+\/\d+/)
      })
    })

    it('should return an array', () => {
      expect(response.data).to.be.an('array')
    })
  })
})
