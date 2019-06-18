import { ObjectId } from 'mongodb'

export class Course {
  static readonly collection: string = 'courses'

  constructor (
    public readonly id: ObjectId,
    public name: string,
    public description: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    public readonly deletedAt: Date | null = null
  ) {}

  toObject() {
    return { ...this }
  }
}
