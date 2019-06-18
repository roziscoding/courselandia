import rescue from 'express-rescue'
import { Request, Response, NextFunction } from 'express'
import { UserService } from '../../../services/UserService'
import { CourseService } from '../../../services/CourseService'
import { UserNotFoundError } from '../../../services/errors/users/UserNotFoundError';
import { boom } from '@expresso/errors';

export function factory (userService: UserService, courseService: CourseService) {
  return [
    rescue(async (req: Request, res: Response) => {
      const { student: userId } = req.params

      const user = await userService.find(userId)

      const courses = await courseService.getManyById(user.courses)

      res.status(200)
        .json(courses.map(course => course.toObject()))
    }),
    (err: any, _req: Request, _res: Response, next: NextFunction) => {
      if (err instanceof UserNotFoundError) {
        return next(boom.notFound(err.message, { code: 'user_not_found' }))
      }

      next(err)
    }
  ]
}
