import { exportReducer } from '../../utils/reduxUtils'

import * as TableViewsState from './tableViewsState'

import { appUserLogout } from '../../app/actions'
import { surveyCreate, surveyDelete, surveyUpdate } from '../../survey/actions'
import { tableViewsListUpdate, tableViewsModuleActiveUpdate } from './actions'

const actionHandlers = {

  // reset form
  [appUserLogout]: () => ({}),
  [surveyCreate]: () => ({}),
  [surveyUpdate]: () => ({}),
  [surveyDelete]: () => ({}),

  [tableViewsListUpdate]: (state, { type, ...actionProps }) => TableViewsState.assocListUpdateProps(actionProps)(state),

  [tableViewsModuleActiveUpdate]: (state, { module }) => TableViewsState.assocModuleActive(module)(state),

}

export default exportReducer(actionHandlers)