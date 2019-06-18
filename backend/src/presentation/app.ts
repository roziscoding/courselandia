import 'reflect-metadata'
import routes from './routes'
import { factory as auth } from '@expresso/auth'
import { container } from 'tsyringe'
import expresso from '@expresso/app'
import errors from '@expresso/errors'
import { Services } from '../services'
import { AppConfig } from '../app-config'
import mongodb from '../data/connections/mongodb'

export const app = expresso(async (app, config: AppConfig, environment) => {
  const { jwt } = auth(config.auth)
  container.register('JwtConfig', { useValue: config.auth.jwt })

  const mongodbConnection = await mongodb.createConnection(config.mongodb, config.name)
  container.register('MongodbConnection', { useValue: mongodbConnection })

  const services = container.resolve(Services)

  /**
   * Courses
   * =======
   */
  app.get('/courses', routes.courses.list.factory(services.courses))
  app.get('/courses/:id', routes.courses.find.factory(services.courses))
  app.post('/student/:student/courses', jwt, routes.courses.addToUser.factory(services.users))
  app.get('/student/:student/courses', jwt, routes.courses.getByUser.factory(services.users, services.courses))

  /**
   * Authentication
   * ==============
   */
  app.post('/login', routes.auth.login.factory(services.authentication))
  app.post('/signup', routes.auth.signup.factory(services.users))

  app.use(errors(environment, config.name))
})
