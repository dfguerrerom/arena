import React, { useState, useEffect } from 'react'
import * as R from 'ramda'

import AuthGroups from '../../../../../common/auth/authGroups'
import UserValidator from '../../../../../common/user/userValidator'

import useI18n from '../../../../commonComponents/useI18n'
import { useAsyncPostRequest, useFormObject, useOnUpdate } from '../../../../commonComponents/hooks'

import { appModuleUri, userModules } from '../../../appModules'

export const useUserInviteState = props => {

  const {
    surveyId, groups: groupsProps, history,
    showAppLoader, hideAppLoader, showNotificationMessage,
  } = props

  const i18n = useI18n()

  const [groups, setGroups] = useState([])

  const {
    object, objectValid,
    setObjectField, enableValidation, getFieldValidation
  } = useFormObject({ email: '', groupUuid: null }, UserValidator.validateNewUser)

  const { data, error, dispatch } = useAsyncPostRequest(
    `/api/survey/${surveyId}/users/invite`,
    { ...object }
  )

  // init groups
  useEffect(() => {
    const groups = groupsProps.map(g => ({
      uuid: AuthGroups.getUuid(g),
      label: i18n.t(`authGroups.${AuthGroups.getName(g)}.label`)
    }))

    setGroups(groups)
  }, [])

  // server responses update
  useOnUpdate(() => {
    hideAppLoader()
    if (data) {
      history.push(appModuleUri(userModules.users))
      showNotificationMessage('usersView.inviteUserConfirmation', { email: object.email })
    }
  }, [data, error])

  // ==== form functions

  const setEmail = email => {
    setObjectField('email', email)
  }

  const setGroup = group => {
    const groupUuid = AuthGroups.getUuid(group)
    setObjectField('groupUuid', groupUuid)
  }

  const inviteUser = () => {
    if (objectValid) {
      showAppLoader()
      dispatch()
    } else {
      enableValidation()
    }
  }

  return {
    email: object.email,
    group: groups.find(R.propEq('uuid', object.groupUuid)),
    groups,

    setEmail,
    setGroup,
    getFieldValidation,
    inviteUser,
  }

}