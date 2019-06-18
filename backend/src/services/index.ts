import { injectable } from 'tsyringe'
import { UserService } from './UserService'
import { CourseService } from './CourseService'
import { AuthenticationService } from './AuthenticationService'

@injectable()
export class Services {
  constructor (
    public readonly courses: CourseService,
    public readonly authentication: AuthenticationService,
    public readonly users: UserService
  ) { }
}
