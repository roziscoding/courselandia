import { Collection, ObjectId } from 'mongodb'
import { IEntity } from '../structures/IEntity'

type Query = Record<string, any>

export abstract class Repository<TEntity extends IEntity> {
  constructor (protected readonly collection: Collection) {}

  private async create (entity: TEntity) {
    const data = await this.serialize(entity)

    await this.collection.insert(data)

    return entity
  }

  private async update (entity: TEntity) {
    const { _id, ...data } = await this.serialize(entity)

    const update = { $set: { ...data } }

    await this.collection.updateOne({ _id }, update)

    return entity
  }

  protected serialize (_entity: TEntity): { _id: ObjectId } & { [ k: string ]: any } {
    throw new Error('Method serialize was not implemented by child class')
  }

  protected deserialize (_data: { _id: ObjectId } & { [ k: string ]: any }): TEntity {
    throw new Error('Method deserialize was not implemented by child class')
  }

  protected async existsBy(query: Query): Promise<boolean> {
    return this.collection.count(query)
      .then(count => count > 0)
  }

  protected findOneBy (query: Query): Promise<TEntity | null> {
    return this.collection.find(query)
      .limit(1)
      .toArray()
      .then(([result]) => result ? this.deserialize(result) : null)
  }

  protected async runPaginatedQuery (query: Query, page: number = 0, size: number = 10) {
    const total = await this.collection.count(query)

    const results = await this.collection.find(query)
      .limit(size)
      .skip(size * page)
      .toArray()
      .then(results => results.map(this.deserialize.bind(this)))

    return { total, results }
  }

  public async save (entity: TEntity): Promise<TEntity> {
    const exists = await this.existsBy({ _id: entity.id })

    if (!exists) return this.create(entity)
    return this.update(entity)
  }

  public async find (id: ObjectId) {
    return this.findOneBy({ _id: id })
  }
}
