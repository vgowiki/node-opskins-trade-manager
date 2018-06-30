class Invalid extends Error {
  constructor(...args) {
    if(!args.length) return

    if(args.length == 1) {
      super(`parameter is invalid: ${args[0]}`)
    } else {
      super(`parameters are invalid: ${args}`)
    }

    this.name = 'Invalid parameter'
    this.param = args

    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = Invalid