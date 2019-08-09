const R = require('ramda')
const StringUtils = require('../stringUtils')
const AuthGroups = require('../auth/authGroups')

const keys = {
  uuid: 'uuid',
  surveyId: 'surveyId',
  name: 'name',
  email: 'email',
  authGroups: 'authGroups',

  groupName: 'groupName',
}

// ==== User properties
const getUuid = R.prop(keys.uuid)

const getName = R.prop(keys.name)

const getEmail = R.prop(keys.email)

const getAuthGroups = R.prop(keys.authGroups)

const getAuthGroupAdmin = R.pipe(
  getAuthGroups,
  R.find(AuthGroups.isAdminGroup)
)

const hasAccepted = R.pipe(
  R.propOr('', keys.name),
  StringUtils.isNotBlank
)

// The following methods are used in UserListView. They are meant to work on the
// object returned by the '/api/survey/:surveyId/users' entry point.
const getGroupName = R.prop(keys.groupName)

// ==== User record permissions
const getRecordPermissions = record => user =>
  R.pipe(
    getAuthGroups,
    R.find(
      R.propEq(keys.surveyId, R.prop(keys.surveyId, record))
    )
  )(user)

module.exports = {
  keys,

  getUuid,
  getName,
  getEmail,
  getAuthGroups,
  getAuthGroupAdmin,
  hasAccepted,

  getGroupName,

  getRecordPermissions,
}
