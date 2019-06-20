import rescue from 'express-rescue'
import { boom } from '@expresso/errors/dist'
import { NextFunction, Request, Response } from 'express'
import { UserService } from '../../../services/UserService'
import { validate } from '@expresso/validator/dist/validator'
import { UserNotFoundError } from '../../../services/errors/users/UserNotFoundError'
import { CourseNotFoundError } from '../../../services/errors/courses/CourseNotFoundError'

export function factory (service: UserService) {
  return [
    validate({
      type: 'object',
      properties: {
        courseId: { type: 'string' }
      },
      required: ['courseId']
    }),
    rescue(async (req: Request, res: Response, next: NextFunction) => {
      const { id } = (req as any).user
      const { courseId } = req.body

      if (id !== req.params.student) {
        return next(boom.forbidden('you cannot add a course to another user'))
      }

      await service.signUpToCourse(id, courseId)

      res.status(204)
        .end()
    }),
    (err: any, _req: Request, _res: Response, next: NextFunction) => {
      if (err instanceof UserNotFoundError) {
        return next(boom.notFound(err.message, { code: 'user_not_found' }))
      }

      if (err instanceof CourseNotFoundError) {
        return next(boom.notFound(err.message, { code: 'course_not_found' }))
      }

      next(err)
    }
  ]
}
