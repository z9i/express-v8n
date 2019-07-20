'use strict'

const Joi = require('@hapi/joi')

class v8nError extends Error {
  constructor(errors) {
    super()
    this.name = 'v8nError'
    this.message = 'v8n error'
    this.errors = errors
  }

  toString() {
    return JSON.stringify(this.toJSON())
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      errors: this.errors
    }
  }
}

const allowUnknownOptions = {
  body: true,
  query: true,
  params: true,
  headers: true
}

const allModes = Object.keys(allowUnknownOptions)

module.exports = function v8n(schema, allowUnknown) {
  if (!schema) {
    throw new Error('schema is required')
  }

  return function (req, res, next) {
    var errors = []

    allModes.forEach(mode => {
      if (schema[mode]) {
        Joi.validate(req[mode], schema[mode], {
          abortEarly: false,
          allowUnknown: typeof allowUnknown === 'boolean' ? allowUnknown : allowUnknownOptions[mode]
        }, (err, value) => {
          if (!err || err.details.length === 0) {
            return
          }
          err.details.forEach(item => {
            errors.push(item)
          })
        })
      }
    })

    if (errors.length === 0) {
      return next()
    }

    return next(new v8nError(errors))
  }
}

module.exports.v8nError = v8nError