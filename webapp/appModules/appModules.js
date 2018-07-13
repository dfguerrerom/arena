import * as R from 'ramda'

const dashboard = 'dashboard'
const rootStatePath = 'appModules'

export const apiUri = (surveyId, module, dashboard) => (
  `/api/appModules/${module}${dashboard ? '/dashboard' : ''}/${surveyId}`
)

export const appModules = {
  survey: 'survey',
  surveyDesigner: 'surveyDesigner',
  dataExplorer: 'dataExplorer',
  dataAnalysis: 'dataAnalysis',
  users: 'users',
}

export const getData = (module) => R.path([rootStatePath, module, 'data'])

export const getDashboardData = (module) => R.path([rootStatePath, module, 'dashboard'])

export const actionTypes = {
  appModulesDashboardDataLoaded: 'appModules/dashboardData/loaded',
  appModulesDataLoaded: 'appModules/data/loaded',
}

