import * as R from 'ramda'

import { excludePathRoot } from '../app-utils/reduxUtils'
import { appDashboard } from '../appModules/appModules'
import { getLocationPathname } from '../app-utils/routerUtils'

//default home is dashboard
export const appModuleUri = (module = appDashboard, dashboard = false) => (
  dashboard
    ? appDashboardUri
    : ['/app', module].join('/') + '/'
)

export const appDashboardUri = appModuleUri(appDashboard)
export const loginUri = '/'

const isPath = path => R.pipe(
  getLocationPathname,
  R.equals(path),
)
export const isLocationLogin = isPath(loginUri)

export const isLocationHome = isPath(appModuleUri())

export const systemStatus = {
  ready: 'ready'
}

const app = 'app'
const appSurvey = ['app', 'survey']

const statePath = {
  //application status
  status: [app, 'status'],

  //logged in user
  user: [app, 'user'],

  //active survey
  survey: {
    id: [...appSurvey, 'id'],
    status: [...appSurvey, 'status'],
  },
}

export const appState = {

  isReady: R.pathEq(statePath.status, systemStatus.ready),

  getUser: R.path(statePath.user),

  logoutUser: R.dissocPath(excludePathRoot(statePath.user)),

  //TODO Move to root survey state??
  surveyId: R.path(statePath.survey.id),

  surveyStatus: R.path(statePath.survey.status),

}

