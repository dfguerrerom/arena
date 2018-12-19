const R = require('ramda')

const nbsp = '\xA0'

const trim = R.pipe(R.defaultTo(''), R.trim)

const leftTrim = R.replace(/^\s+/, '')

const toLower = (a = '') => R.toLower(a.toString())

const truncate = maxLength =>
  text =>
    text.length > maxLength ? text.substring(0, maxLength) + '...' : text

const contains = (a = '', b = '') => R.includes(toLower(a), toLower(b))

const isBlank = R.pipe(trim, R.isEmpty)

const isNotBlank = R.pipe(isBlank, R.not)

const isString = R.is(String)

const normalizeName = R.pipe(
  leftTrim,
  R.toLower,
  R.replace(/[^a-z0-9]/g, '_'),
  R.slice(0, 60),
)

module.exports = {
  nbsp,

  trim,
  leftTrim,
  truncate,
  contains,

  isBlank,
  isNotBlank,

  isString,

  normalizeName,

}
