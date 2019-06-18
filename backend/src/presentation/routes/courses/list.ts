import rescue from 'express-rescue'
import { Request, Response } from 'express'
import { CourseService } from '../../../services/CourseService'

export function factory (service: CourseService) {
  return [
    rescue(async (req: Request, res: Response) => {
      const { page, size } = req.query

      const { total, results } = await service.list(page, size)

      const status = total > results.length ? 206 : 200

      if (status === 206) {
        const from = page * size
        const to = from + results.length

        res.append('x-content-range', `results ${from}-${to}/${total}`)
      }

      const data = results.map(course => course.toObject())

      res.status(status)
        .json(data)
    })
  ]
}
