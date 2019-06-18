export class UserNotFoundError extends Error {
  constructor (email: string) {
    super(`user '${email}' not found`)
  }
}
