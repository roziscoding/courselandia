export class EmailAlreadyExistsError extends Error {
  constructor (email: string) {
    super(`a user with email '${email}' already exists`)
  }
}
