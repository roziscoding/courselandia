import rescue from 'express-rescue'
import { Request, Response } from 'express'
import { UserService } from '../../../services/UserService'

export function factory (_service: UserService) {
  return [
    rescue(async (req: Request, res: Response) => {
      console.log((req as any).user.id, req.params.student)
      res.status(200).end()
    })
  ]
}
