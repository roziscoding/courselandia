export class InvalidPasswordError extends Error {
  constructor () {
    super('provided password is not valid')
  }
}
