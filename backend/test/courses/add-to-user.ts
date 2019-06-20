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

import { auth, courses } from '../fixtures'

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

describe('POST /student/5d06672bb502f222c9fd9534/courses', () => {
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
    await database.collection('courses')
      .remove({})
  })

  describe('When authorization fails', () => {
    let response: AxiosResponse<any>

    before(async () => {
      const payload = { courseId: '5cfb93906462ee65f27b4ad8' }
      const headers = { Authorization: `Bearer ${auth.invalidToken}` }
      response = await api.post('/student/5d06672bb502f222c9fd9534/courses', payload, { headers })
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
      response = await api.post('/student/5d06672bb502f222c9fd9534/courses', {}, { headers })
    })

    it('should return HTTP 402', () => {
      expect(response.status).to.be.equal(422)
    })

    it('should return an error object', () => {
      expect(response.data).to.have.property('error')
    })

    it('should return a `unprocessable_entity` error code', () => {
      expect(response.data.error.code).to.be.equal('unprocessable_entity')
    })
  })

  describe('When user does not exist', () => {
    let response: AxiosResponse<any>

    before(async () => {
      const payload = { courseId: '5cfb93906462ee65f27b4ad8' }
      const headers = { Authorization: `Bearer ${auth.validToken}` }
      response = await api.post('/student/5d06672bb502f222c9fd9534/courses', payload, { headers })
    })

    it('should return HTTP 404', () => {
      expect(response.status).to.be.equal(404)
    })

    it('should return an error object', () => {
      expect(response.data).to.have.property('error')
    })

    it('should return a `user_not_found` error code', () => {
      expect(response.data.error.code).to.be.equal('user_not_found')
    })
  })

  describe('When course does not exist', () => {
    let response: AxiosResponse<any>

    before(async () => {
      const user = (({ _id, ...data }) => ({ _id: new ObjectId(_id), ...data }))(auth.user)

      await database.collection('users').insert(user)

      const payload = { courseId: courses.course._id }
      const headers = { Authorization: `Bearer ${auth.validToken}` }
      response = await api.post('/student/5d06672bb502f222c9fd9534/courses', payload, { headers })
    })

    it('should return HTTP 404', () => {
      expect(response.status).to.be.equal(404)
    })

    it('should return an error object', () => {
      expect(response.data).to.have.property('error')
    })

    it('should return a `course_not_found` error code', () => {
      expect(response.data.error.code).to.be.equal('course_not_found')
    })
  })

  describe('When student and user IDs are different', () => {
    let response: AxiosResponse<any>

    before(async () => {
      const user = (({ _id, ...data }) => ({ _id: new ObjectId(_id), ...data }))(auth.user)
      await database.collection('users').insert(user)
      const course = (({ _id, ...data }) => ({ _id: new ObjectId(_id), ...data }))(courses.course)
      await database.collection('courses').insert(course)

      const payload = { courseId: courses.course._id }
      const headers = { Authorization: `Bearer ${auth.validToken}` }
      response = await api.post('/student/5d06672bb502f222c9fd9535/courses', payload, { headers })
    })

    it('should return HTTP 403', () => {
      expect(response.status).to.be.equal(403)
    })

    it('should return an error object', () => {
      expect(response.data).to.have.property('error')
    })

    it('should return a `forbidden` error code', () => {
      expect(response.data.error.code).to.be.equal('forbidden')
    })
  })

  describe('When course is added', () => {
    let response: AxiosResponse<any>
    let user: any

    before(async () => {
      const newUser = (({ _id, ...data }) => ({ _id: new ObjectId(_id), ...data }))(auth.user)
      await database.collection('users').insert(newUser)
      const course = (({ _id, ...data }) => ({ _id: new ObjectId(_id), ...data }))(courses.course)
      await database.collection('courses').insert(course)

      const payload = { courseId: courses.course._id }
      const headers = { Authorization: `Bearer ${auth.validToken}` }
      response = await api.post('/student/5d06672bb502f222c9fd9534/courses', payload, { headers })
      user = await database.collection('users').findOne({ _id: newUser._id })
    })

    it('should return HTTP 204', () => {
      expect(response.status).to.be.equal(204)
    })

    it('should add the course ID to the array of user courses', () => {
      expect(user.courses.length).to.be.equal(1)
    })
  })
})
