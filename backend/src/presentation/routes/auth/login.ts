import rescue from 'express-rescue'
import { boom } from '@expresso/errors'
import { validate } from '@expresso/validator'
import { Request, Response, NextFunction } from 'express'
import { AuthenticationService } from '../../../services/AuthenticationService'
import { UserNotFoundError } from '../../../services/errors/users/UserNotFoundError'
import { InvalidPasswordError } from '../../../services/errors/users/InvalidPasswordError'

export function factory (service: AuthenticationService) {
  return [
    validate({
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string' }
      },
      required: ['password', 'email']
    }),
    rescue(async (req: Request, res: Response) => {
      const { email, password } = req.body

      const token = await service.login(email, password)

      res.status(200).json({ token })
    }),
    (err: any, _req: Request, _res: Response, next: NextFunction) => {
      if (err instanceof UserNotFoundError || err instanceof InvalidPasswordError) {
        return next(boom.unauthorized())
      }

      next(err)
    }
  ]
}
