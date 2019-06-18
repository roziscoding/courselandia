export class CourseNotFoundError extends Error {
  constructor (courseId: string) {
    super(`course with id ${courseId} was not found`)
  }
}
