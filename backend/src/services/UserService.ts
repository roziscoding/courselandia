import argon2 from 'argon2'
import { ObjectId } from 'mongodb'
import { injectable } from 'tsyringe'
import { User } from '../domain/User'
import { CourseService } from './CourseService'
import { UserRepository } from '../data/repositories/UserRepository'
import { UserNotFoundError } from './errors/users/UserNotFoundError'
import { EmailAlreadyExistsError } from './errors/users/EmailAlreadyExistsError'

@injectable()
export class UserService {
  constructor (
    private readonly repository: UserRepository,
    private readonly courseService: CourseService
  ) { }

  async create (email: string, password: string) {
    const id = new ObjectId()
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id })

    if (await this.repository.exists(email)) {
      throw new EmailAlreadyExistsError(email)
    }

    const user = new User(id, email, passwordHash)

    await this.repository.save(user)

    return user
  }

  async find (id: string) {
    const user = await this.repository.findById(id)
    if (!user) throw new UserNotFoundError(id)
    return user
  }

  async findByEmail (email: string) {
    const user = await this.repository.findByEmail(email)
    if (!user) throw new UserNotFoundError(email)
    return user
  }

  async signUpToCourse (userId: string, courseId: string) {
    const user = await this.find(userId)
    const course = await this.courseService.find(courseId)

    user.courses.push(course.id)

    await this.repository.save(user)
  }
}
