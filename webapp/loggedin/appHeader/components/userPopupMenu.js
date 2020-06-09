import './userPopupMenu.scss'

import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'

import * as User from '@core/user/user'

import { clickedOutside } from '@webapp/utils/domUtils'

import { useI18n } from '@webapp/store/system'
import { useUser, UserActions } from '@webapp/store/user'

import { appModuleUri, homeModules, userModules } from '@webapp/app/appModules'

import ProfilePicture from '@webapp/components/profilePicture'

const UserPopupMenu = (props) => {
  const { onClose } = props

  const dispatch = useDispatch()
  const i18n = useI18n()
  const elementRef = useRef(null)

  const user = useUser()

  useEffect(() => {
    const onClickListener = (e) => {
      if (clickedOutside(elementRef.current, e)) {
        onClose()
      }
    }

    window.addEventListener('click', onClickListener)

    return () => {
      window.removeEventListener('click', onClickListener)
    }
  }, [])

  return (
    <div className="user-popup-menu" ref={elementRef} onMouseLeave={onClose}>
      <div className="user-popup-menu__user">
        <ProfilePicture userUuid={User.getUuid(user)} />

        <div className="user-details">
          <div>{User.getName(user)}</div>
          <div>
            <Link
              className="btn-s btn-transparent"
              to={`${appModuleUri(userModules.user)}${User.getUuid(user)}/`}
              onClick={onClose}
            >
              <span className="icon icon-user icon-12px icon-left" />
              {i18n.t('header.myProfile')}
            </Link>
          </div>
        </div>
      </div>

      <div className="user-popup-menu__sep" />

      <Link to={appModuleUri(homeModules.surveyList)} onClick={onClose} className="btn-s btn-transparent">
        <span className="icon icon-paragraph-justify icon-12px icon-left" />
        {i18n.t('appModules.surveyList')}
      </Link>

      {User.isSystemAdmin(user) && (
        <Link to={appModuleUri(homeModules.surveyNew)} onClick={onClose} className="btn-s btn-transparent">
          <span className="icon icon-plus icon-12px icon-left" />
          {i18n.t('homeView.createSurvey')}
        </Link>
      )}

      <div className="user-popup-menu__sep" />

      <a
        className="btn-s btn-transparent"
        onClick={() => {
          onClose()
          dispatch(UserActions.logout())
        }}
      >
        <span className="icon icon-switch icon-12px icon-left" />
        {i18n.t('sidebar.logout')}
      </a>
    </div>
  )
}

UserPopupMenu.propTypes = {
  onClose: PropTypes.func,
}

UserPopupMenu.defaultProps = {
  onClose: () => ({}),
}

export default UserPopupMenu
