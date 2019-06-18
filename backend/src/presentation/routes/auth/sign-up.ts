import rescue from 'express-rescue'
import { validate } from '@expresso/validator'
import { Request, Response, NextFunction } from 'express'
import { UserService } from '../../../services/UserService'
import { EmailAlreadyExistsError } from '../../../services/errors/users/EmailAlreadyExistsError';
import { boom } from '@expresso/errors';

export function factory (service: UserService) {
  return [
    validate({
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string' }
      },
      required: ['email', 'password']
    }),
    rescue(async (req: Request, res: Response) => {
      const { email, password } = req.body

      const user = await service.create(email, password)

      res.status(201)
        .json(user.toObject())
    }),
    (err: any, _req: Request, _res: Response, next: NextFunction) => {
      if (err instanceof EmailAlreadyExistsError) {
        return next(boom.conflict(err.message, { code: 'email_already_exists' }))
      }

      next(err)
    }
  ]
}
