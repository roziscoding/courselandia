import argon2 from 'argon2'
import { Jwt } from '../util/Jwt'
import { injectable } from 'tsyringe'
import { UserService } from './UserService'
import { InvalidPasswordError } from './errors/users/InvalidPasswordError'

@injectable()
export class AuthenticationService {
  constructor (
    private readonly jwt: Jwt,
    private readonly userService: UserService
  ) {}

  async login (email: string, password: string) {
    const user = await this.userService.findByEmail(email)

    if (!await argon2.verify(user.passwordHash, password)) {
      throw new InvalidPasswordError()
    }

    const token = this.jwt.getToken(user.toObject())

    return token
  }
}
