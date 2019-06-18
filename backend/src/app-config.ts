import env from 'sugar-env'
import { IAuthConfig } from '@expresso/auth'

const auth: IAuthConfig = {
  jwt: {
    algorithms: ['HS256'],
    secret: env.get('AUTH_JWT_SECRET', ''),
    issuer: env.get('AUTH_JWT_AUDIENCE', 'courselandia'),
    audience: env.get('AUTH_JWT_AUDIENCE', 'courselandia')
  }
}

export const config = {
  name: 'courselandia',
  mongodb: {
    dbName: env.get('MONGODB_DBNAME', 'courselandia'),
    uri: env.get('MONGODB_URI', 'mongodb://localhost:27017/courselandia')
  },
  auth
}

export type AppConfig = typeof config
