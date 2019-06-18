import mongodb from 'mongodb'

export interface IMongodbParams {
  uri: string,
  dbName: string
}

export async function createConnection (params: IMongodbParams, appName: string) {
  const connection = await mongodb.connect(params.uri, {
    useNewUrlParser: true,
    appname: appName,
    reconnectTries: 3,
    reconnectInterval: 5000
  })

  return connection.db(params.dbName)
}

export default { createConnection }
