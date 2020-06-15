import React from 'react'

import * as User from '@core/user/user'

import ModuleSwitch from '@webapp/components/moduleSwitch'
import SurveyInfoView from '@webapp/loggedin/modules/designer/surveyInfo/surveyInfoView'
import { appModules, appModuleUri, homeModules } from '@webapp/app/appModules'
import { useUser } from '@webapp/store/user'

import SurveyCreateView from '@webapp/loggedin/modules/home/surveyCreate/surveyCreateView'
import CollectImportReportView from '@webapp/loggedin/modules/home/collectImportReport/collectImportReportView'

import Dashboard from './Dashboard'
import SurveyList from './SurveyList'

const Home = () => {
  const user = useUser()

  return (
    <ModuleSwitch
      moduleRoot={appModules.home}
      moduleDefault={homeModules.dashboard}
      modules={[
        {
          component: Dashboard,
          path: appModuleUri(homeModules.dashboard),
        },
        {
          component: SurveyList,
          path: appModuleUri(homeModules.surveyList),
        },
        ...(User.isSystemAdmin(user)
          ? [
              {
                component: SurveyCreateView,
                path: appModuleUri(homeModules.surveyNew),
              },
            ]
          : []),
        {
          component: SurveyInfoView,
          path: appModuleUri(homeModules.surveyInfo),
        },
        {
          component: CollectImportReportView,
          path: appModuleUri(homeModules.collectImportReport),
        },
      ]}
    />
  )
}

export default Home
