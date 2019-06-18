import { injectable, inject } from 'tsyringe'
import { Db, ObjectId } from 'mongodb'
import { Repository } from './Repository'
import { Course } from '../../domain/Course'

@injectable()
export class CourseRepository extends Repository<Course> {
  constructor (@inject('MongodbConnection') connection: Db) {
    super(connection.collection(Course.collection))
  }

  protected serialize (Course: Course) {
    return (({ id, ...Course }: Course) => ({ _id: id, ...Course }))(Course)
  }

  protected deserialize (data: { _id: ObjectId } & { [k:string]: any }) {
    return new Course(data._id, data.name, data.description, data.createdAt, data.updatedAt, data.deletedAt)
  }

  async getAll (page?: number, size?: number) {
    return this.runPaginatedQuery({}, page, size)
  }

  async getManyByIds (ids: ObjectId[]) {
    return this.collection.find({ _id: { $in: ids } })
      .toArray()
      .then(results => results.map(this.deserialize))
  }
}
