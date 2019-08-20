import React, { useEffect, useState } from 'react'
import * as R from 'ramda'

import useI18n from '../../../../commonComponents/useI18n'

import User from '../../../../../common/user/user'
import Survey from '../../../../../common/survey/survey'
import UserValidator from '../../../../../common/user/userValidator'
import AuthGroups from '../../../../../common/auth/authGroups'
import Authorizer from '../../../../../common/auth/authorizer'

import {
  useAsyncGetRequest,
  useAsyncPostRequest,
  useAsyncPutRequest,
  useFormObject,
  useOnUpdate
} from '../../../../commonComponents/hooks'

import { appModuleUri, userModules } from '../../../appModules'

export const useUserViewState = props => {
  const {
    user, surveyInfo, userUuidUrlParam, groups: groupsProps,
    showAppLoader, hideAppLoader, showNotificationMessage, setUser,
    history,
  } = props

  const surveyId = Survey.getIdSurveyInfo(surveyInfo)
  const i18n = useI18n()

  const { data: userToUpdate = {}, dispatch: fetchUser, loaded } = useAsyncGetRequest(
    `/api/survey/${surveyId}/user/${userUuidUrlParam}`
  )

  const isInvitation = !userUuidUrlParam
  const isUserAcceptPending = !(isInvitation || User.hasAccepted(userToUpdate))

  // form fields edit permissions
  const [editPermissions, setEditPermissions] = useState({
    name: false,
    group: isInvitation ? Authorizer.canInviteUsers(user, surveyInfo) : false,
    email: isInvitation ? Authorizer.canInviteUsers(user, surveyInfo) : false,
  })

  // local form object
  const {
    object: formObject, objectValid,
    setObjectField, enableValidation, getFieldValidation,
  } = useFormObject(
    { name: '', email: '', groupUuid: null },
    isInvitation || isUserAcceptPending ? UserValidator.validateInvitation : UserValidator.validateUser,
    !isInvitation
  )

  // form object setters
  const setName = name => setObjectField('name', name)
  const setEmail = email => setObjectField('email', email)
  const setGroup = group => {
    const groupUuid = AuthGroups.getUuid(group)
    setObjectField('groupUuid', groupUuid)
  }

  const [surveyGroups, setSurveyGroups] = useState([])

  useEffect(() => {
    // init form groups
    setSurveyGroups(groupsProps.map(g => ({
      uuid: AuthGroups.getUuid(g),
      label: i18n.t(`authGroups.${AuthGroups.getName(g)}.label`)
    })))

    // init user
    if (!isInvitation) {
      fetchUser()
    }
  }, [])

  useEffect(() => {
    if (loaded) {
      // set form object field from server side response
      setName(isUserAcceptPending ? '' : User.getName(userToUpdate)) // Name can be null if user has not accepted the invitation
      setEmail(User.getEmail(userToUpdate))
      setGroup(Authorizer.getSurveyUserGroup(userToUpdate, surveyInfo))

      // set edit form permissions
      const canEdit = Authorizer.canEditUser(user, surveyInfo, userToUpdate)
      setEditPermissions({
        name: !isUserAcceptPending && canEdit,
        email: !isUserAcceptPending && Authorizer.canEditUserEmail(user, surveyInfo, userToUpdate),
        group: !isUserAcceptPending && Authorizer.canEditUserGroup(user, surveyInfo, userToUpdate),
      })

      enableValidation()
    }
  }, [loaded])

  // persist user/invitation actions
  const {
    dispatch: saveUser,
    loaded: userSaved,
    data: userSaveResponse,
    error: userSaveError,
  } = isInvitation
    ? useAsyncPostRequest(`/api/survey/${surveyId}/users/invite`, R.omit(['name'], formObject))
    : useAsyncPutRequest(`/api/survey/${surveyId}/user/${User.getUuid(userToUpdate)}`, formObject)

  useOnUpdate(() => {
    hideAppLoader()
    if (userSaveError) {
      showNotificationMessage('userView.errorSavingUser', { error: userSaveError })
    } else if (userSaved) {
      // update user in redux state if self
      if (User.isEqual(user)(userSaveResponse)) {
        setUser(userSaveResponse)
      }

      if (isInvitation) {
        showNotificationMessage('usersView.inviteUserConfirmation', { email: formObject.email })
      } else {
        showNotificationMessage('usersView.updateUserConfirmation', { name: formObject.name })
      }

      history.push(appModuleUri(userModules.users))
    }
  }, [userSaved, userSaveError])

  const sendRequest = () => {
    showAppLoader()
    saveUser()
  }

  return {
    loaded: isInvitation || loaded,

    isUserAcceptPending,
    isInvitation,

    canEdit: editPermissions.name || editPermissions.group || editPermissions.email,
    canEditName: editPermissions.name,
    canEditGroup: editPermissions.group,
    canEditEmail: editPermissions.email,

    name: formObject.name,
    email: formObject.email,
    group: surveyGroups.find(R.propEq('uuid', formObject.groupUuid)),
    surveyGroups,
    objectValid,

    getFieldValidation,
    setName,
    setEmail,
    setGroup,
    sendRequest,
  }
}