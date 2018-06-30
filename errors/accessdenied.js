class AccessDenied extends Error {
  constructor(message) {
    super(message)

    this.name = 'Access denied'

    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = AccessDenied