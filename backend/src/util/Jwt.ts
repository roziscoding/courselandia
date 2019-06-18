import { ObjectId } from 'mongodb'
import { IAuthConfig } from '@expresso/auth'
import { injectable, inject } from 'tsyringe'
import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken'

@injectable()
export class Jwt {
  constructor (@inject('JwtConfig') private readonly options: Required<IAuthConfig['jwt']>) { }

  private getOptions (): VerifyOptions
  private getOptions (subject: string): SignOptions
  private getOptions (subject?: string): SignOptions {
    const options = {
      algorithm: this.options.algorithms[0],
      audience: this.options.audience,
      issuer: this.options.issuer
    }

    return subject
      ? { ...options, subject: `urn:user:${subject}` }
      : options
  }

  getToken (payload: object & { id: ObjectId }) {
    return jwt.sign({ ...payload }, this.options.secret, this.getOptions(payload.id.toHexString()))
  }

  validateToken (token: string) {
    return jwt.verify(token, this.options.secret, this.getOptions())
  }
}
