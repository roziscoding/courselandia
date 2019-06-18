import { ObjectId } from 'mongodb'
import { injectable } from 'tsyringe'
import { CourseRepository } from '../data/repositories/CourseRepository'
import { CourseNotFoundError } from './errors/courses/CourseNotFoundError'

@injectable()
export class CourseService {
  constructor (private readonly repository: CourseRepository) { }

  async list (page?: number, size?: number) {
    return this.repository.getAll(page, size)
  }

  async find (id: string) {
    if (!ObjectId.isValid(id)) throw new CourseNotFoundError(id)

    const courseId = new ObjectId(id)

    const result = await this.repository.find(courseId)

    if (!result) throw new CourseNotFoundError(id)

    return result
  }

  async getManyById (ids: ObjectId[]) {
    return this.repository.getManyByIds(ids)
  }
}
