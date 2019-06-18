import { ObjectId } from 'mongodb'

export class User {
  static readonly collection: string = 'users'

  constructor (
    public readonly id: ObjectId,
    public email: string,
    public passwordHash: string,
    public courses: ObjectId[] = [],
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    public readonly deletedAt: Date | null = null
  ) { }

  toObject () {
    return (({ passwordHash, courses, ...user }: User) => user)(this)
  }
}
