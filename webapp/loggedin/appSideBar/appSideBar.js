import './appSideBar.scss'

import React, { useRef } from 'react'
import { connect } from 'react-redux'

import AppSideBarModules from './appSideBarModules'
import useI18n from '../../commonComponents/useI18n'

import * as AppState from '../../app/appState'
import * as SurveyState from '../../survey/surveyState'

import { logout, toggleSideBar } from '../../app/actions'

const AppSideBar = (props) => {

  const {
    pathname, surveyInfo, isSideBarOpened,
    logout, toggleSideBar
  } = props

  const element = useRef(null)

  const i18n = useI18n()

  return (
    <div className="app-sidebar" ref={element}>

      {/*logo placeholder*/}
      <div></div>


      <AppSideBarModules
        pathname={pathname}
        surveyInfo={surveyInfo}
        sideBarOpened={isSideBarOpened}/>

      {/*logout */}
      <div>
        <a className="app-sidebar__module-btn text-uppercase"
           onClick={() => logout()}>
            <span
              className={`icon icon-exit ${isSideBarOpened ? ' icon-left' : ''}`}
              style={{ transform: 'scaleX(-1)' }}/>
          {
            isSideBarOpened
              ? <span>{i18n.t('sidebar.logout')}</span>
              : null
          }
        </a>

      </div>

      {/*toggle sidebar */}
      <div>
        <a className="app-sidebar__btn-toggle"
           onClick={() => {
             element.current.classList.toggle('opened')
             toggleSideBar()
           }}>
          <span className="icon icon-16px icon-menu"/>
        </a>
      </div>

    </div>
  )

}

const mapStateToProps = state => ({
  surveyInfo: SurveyState.getSurveyInfo(state),
  isSideBarOpened: AppState.isSideBarOpened(state),
})

export default connect(mapStateToProps, { logout, toggleSideBar })(AppSideBar)