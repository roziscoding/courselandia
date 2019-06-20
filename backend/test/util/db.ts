import debug from 'debug'

const mongodb = require('mongo-mock')
mongodb.max_delay = 0

const log = debug('courselandia:test-utils:db')

export interface IMongodbParams {
  uri: string,
  dbName: string
}

export async function createFakeConnection (params: IMongodbParams, appName: string) {
  log('called createFakeConnection with params %o', params)
  return mongodb.MongoClient.connect(params.uri, {
    useNewUrlParser: true,
    appname: appName,
    reconnectTries: 3,
    reconnectInterval: 5000
  })
}

export function prepareDatabase (fn: (connection: any) => any) {
  return async (params: IMongodbParams, appName: string) => {
    const db = await createFakeConnection(params, appName)

    fn(db)

    return db
  }
}

export default { createFakeConnection, prepareDatabase }
