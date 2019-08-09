const db = require('../../../db/db')

const User = require('../../../../common/user/user')

const UserRepository = require('../repository/userRepository')
const AuthGroupRepository = require('../../auth/repository/authGroupRepository')

const ActivityLog = require('../../activityLog/activityLogger')

// ==== CREATE

const insertUser = async (user, surveyId, uuid, email, groupUuid, client = db) =>
  await client.tx(async t => {
    const newUser = await UserRepository.insertUser(surveyId, uuid, email, t)
    await addUserToGroup(user, surveyId, groupUuid, newUser, t)
  })

const addUserToGroup = async (user, surveyId, groupUuid, userToAdd, client = db) =>
  await client.tx(async t => {
    await AuthGroupRepository.insertUserGroup(groupUuid, User.getUuid(userToAdd), t)
    await ActivityLog.log(
      user,
      surveyId,
      ActivityLog.type.userInvite,
      { groupUuid, uuid: User.getUuid(userToAdd) },
      t
    )
  })

// ==== READ

const _userFetcher = fetchFn => async (...args) => {
  const user = await fetchFn(...args)

  if (user) {
    const authGroups = await AuthGroupRepository.fetchUserGroups(User.getUuid(user))
    return { ...user, authGroups }
  }

  return null
}

const fetchUserByEmail = _userFetcher(UserRepository.fetchUserByEmail)

const fetchUserByUuid = _userFetcher(UserRepository.fetchUserByUuid)

// ==== DELETE

const deleteUserPref = async (user, name) => ({
  ...(await UserRepository.deleteUserPref(user, name)),
  authGroups: await AuthGroupRepository.fetchUserGroups(User.getUuid(user))
})

module.exports = {
  // CREATE
  insertUser,
  addUserToGroup,

  // READ
  fetchUsersBySurveyId: UserRepository.fetchUsersBySurveyId,

  countUsersBySurveyId: UserRepository.countUsersBySurveyId,

  fetchUserByUuid,

  fetchUserByEmail,

  // UPDATE
  updateUsername: UserRepository.updateUsername,

  updateUserPref: UserRepository.updateUserPref,

  // DELETE
  deleteUserPref,
}
