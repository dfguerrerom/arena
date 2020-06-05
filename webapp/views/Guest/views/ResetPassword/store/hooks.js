import { useAsyncGetRequest, useAsyncPutRequest, useOnUpdate } from '@webapp/components/hooks'
import { useEffect, useReducer } from 'react'
import { useHistory, useParams } from 'react-router'
import { useDispatch } from 'react-redux'

import { LoginValidator } from '@webapp/store/login'
import * as Validation from '@core/validation/validation'
import { appModuleUri } from '@webapp/app/appModules'
import { showNotification } from '@webapp/app/appNotification/actions'

import * as actions from './actions'
import reducer from './reducer'
import initialState from './initialState'

export const useResetPassword = () => {
  const dispatchRedux = useDispatch()
  const { uuid } = useParams()
  const history = useHistory()
  const [state, dispatch] = useReducer(reducer, initialState)
  const { name, password, passwordConfirm } = state.user

  const { data: { user } = {}, dispatch: getResetPasswordUser } = useAsyncGetRequest(`/auth/reset-password/${uuid}`)

  const {
    data: { result: resetComplete = false } = {},
    dispatch: dispatchPostResetPassword,
  } = useAsyncPutRequest(`/auth/reset-password/${uuid}`, { name, password })

  const onChangeUser = (event) => actions.updateUser(event)(dispatch)

  const onSubmit = () => {
    ;(async () => {
      const validation = await LoginValidator.validateResetPasswordObj({ name, password, passwordConfirm })
      if (Validation.isValid(validation)) {
        dispatchPostResetPassword()
      } else {
        const error = LoginValidator.getFirstError(validation, ['name', 'password', 'passwordConfirm'])
        actions.updateError(error)(dispatch)
      }
    })()
  }

  useEffect(() => {
    getResetPasswordUser()
  }, [])

  useOnUpdate(() => {
    actions.initUser(user)(dispatch)
  }, [user])

  useOnUpdate(() => {
    history.push(appModuleUri())
    dispatchRedux(showNotification('resetPasswordView.passwordSuccessfullyReset'))
  }, [resetComplete])

  return {
    state,
    onChangeUser,
    onSubmit,
  }
}
