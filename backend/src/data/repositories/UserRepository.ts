import { injectable, inject } from 'tsyringe'
import { Db, ObjectId } from 'mongodb'
import { User } from '../../domain/User'
import { Repository } from './Repository'

@injectable()
export class UserRepository extends Repository<User> {
  constructor (@inject('MongodbConnection') connection: Db) {
    super(connection.collection(User.collection))
  }

  protected serialize (user: User) {
    return (({ id, ...user }: User) => ({ _id: id, ...user }))(user)
  }

  protected deserialize (data: { _id: ObjectId } & { [k:string]: any }) {
    return new User(data._id, data.email, data.passwordHash, data.courses, data.cretedAt, data.updatedAt, data.deletedAt)
  }

  async findByEmail (email: string) {
    return this.findOneBy({ email })
  }

  async exists (email: string) {
    return this.existsBy({ email })
  }

  async findById (id: string) {
    if (!ObjectId.isValid(id)) return null

    return this.findOneBy({ _id: new ObjectId(id) })
  }
}
