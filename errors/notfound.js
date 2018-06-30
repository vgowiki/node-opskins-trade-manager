class NotFound extends Error {
  constructor() {
    super('the requested resource was not found')

    this.name = 'Not found'

    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = NotFound