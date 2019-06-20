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

import { auth, courses } from '../fixtures'

describe('GET /student/5d06672bb502f222c9fd9534/courses', () => {
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
      response = await api.get('/student/5d06672bb502f222c9fd9534/courses', { headers: { Authorization: `Bearer ${auth.invalidToken}` } })
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

  describe('When authentication works', () => {
    let response: AxiosResponse<any>

    before(async () => {
      const courseId = new ObjectId(courses.course._id)
      const newUser = Object.assign({}, auth.user)

      newUser.courses = [courseId]
      newUser._id = new ObjectId(newUser._id)

      await database.collection('users').insert(newUser)
      await database.collection('courses').insert({ ...courses.noIdCourse, _id: courseId })

      response = await api.get('/student/5d06672bb502f222c9fd9534/courses', { headers: { Authorization: `Bearer ${auth.validToken}` } })
    })

    it('should return HTTP 200', () => {
      expect(response.status).to.be.equal(200)
    })

    it('should return an array', () => {
      expect(response.data).to.be.an('array')
    })
  })
})
