import rescue from 'express-rescue'
import { boom } from '@expresso/errors'
import { Request, Response, NextFunction } from 'express'
import { CourseService } from '../../../services/CourseService'
import { CourseNotFoundError } from '../../../services/errors/courses/CourseNotFoundError'

export function factory (service: CourseService) {
  return [
    rescue(async (req: Request, res: Response) => {
      const { id } = req.params

      const course = await service.find(id)

      res.status(200)
        .json(course.toObject())
    }),
    (err: any, _req: Request, _res: Response, next: NextFunction) => {
      if (err instanceof CourseNotFoundError) {
        return next(boom.notFound(err.message))
      }

      next(err)
    }
  ]
}
