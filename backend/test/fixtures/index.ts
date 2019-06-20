const { course, noIdCourse } = require('./courses.json')
const { validAuthToken, invalidAuthToken, user }: Record<string, any> = require('../fixtures/auth.json')

export const auth = {
  validToken: validAuthToken,
  invalidToken: invalidAuthToken,
  user
}

export const courses = {
  course,
  noIdCourse
}
