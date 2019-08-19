import { AuthenticationDetails, CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js'

export const keysAction = {
  success: 'success',
  newPasswordRequired: 'newPasswordRequired'
}

const UserPoolId = __COGNITO_USER_POOL_ID__
const ClientId = __COGNITO_CLIENT_ID__

const getUserPool = () => new CognitoUserPool({ UserPoolId, ClientId })

export const getUser = () => getUserPool().getCurrentUser()

const newCognitoUser = Username => new CognitoUser({ Username, Pool: getUserPool() })

// Global variables to handle completeNewPasswordChallenge flow
let cognitoUser
let sessionUserAttributes

const cognitoCallbacks = (onSuccess, onFailure) => ({
  onSuccess: () => {
    cognitoUser = null
    sessionUserAttributes = null
    onSuccess(keysAction.success)
  },

  onFailure,

  newPasswordRequired: (userAttributes) => {
    // the api doesn't accept this field back
    delete userAttributes.email_verified

    sessionUserAttributes = userAttributes
    onSuccess(keysAction.newPasswordRequired)
  }
})

export const login = (Username, Password) =>
  new Promise((resolve, reject) => {
    cognitoUser = newCognitoUser(Username)
    cognitoUser.authenticateUser(
      new AuthenticationDetails({ Username, Password }),
      cognitoCallbacks(resolve, reject)
    )
  })

export const acceptInvitation = (name, password) =>
  new Promise((resolve, reject) => {
    cognitoUser.completeNewPasswordChallenge(
      password,
      { ...sessionUserAttributes, name },
      cognitoCallbacks(resolve, reject)
    )
  })

export const logout = () => {
  const user = getUser()
  if (user) {
    user.signOut()
  }
}

export const forgotPassword = username =>
  new Promise((resolve, reject) => {
    newCognitoUser(username).forgotPassword(cognitoCallbacks(resolve, reject))
  })

export const resetPassword = (username, verificationCode, newPassword) => {
  cognitoUser = newCognitoUser(username)

  return new Promise((resolve, reject) => {
    cognitoUser.confirmPassword(verificationCode, newPassword, {
      onFailure: reject,
      onSuccess: () => resolve(),
    })
  })
}

/**
 *
 * @returns current accessToken.jwtToken if current session has a user or null if it doesn't
 */
export const getJwtToken = () => new Promise((resolve, reject) => {
  const user = getUser()

  if (user) {
    user.getSession((err, session) => {
      if (err) {
        reject(err)
      }

      try {
        const accessToken = session.getAccessToken()
        const jwtToken = accessToken.jwtToken
        resolve(jwtToken)
      } catch (e) {
        reject(e)
      }

    })
  } else {
    resolve(null)
  }
})
