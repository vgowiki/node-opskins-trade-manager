class Missing extends Error {
  constructor(...args) {
    if(!args.length) return

    if(args.length == 1) {
      super(`parameter is missing: ${args[0]}`)
    } else {
      super(`parameters are missing: ${args}`)
    }

    this.name = 'Missing parameter'
    this.param = args

    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = Missing