class Type extends Error {
  constructor(...args) {
    if(!args.length) return

    if(args.length == 1) {
      super(`following parameter has invalid type: ${args[0]}`)
    } else {
      super(`following parameters have invalid types: ${args}`)
    }

    this.name = 'Type error'
    this.param = args

    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = Type