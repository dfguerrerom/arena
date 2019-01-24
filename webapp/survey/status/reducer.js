import { exportReducer } from '../../appUtils/reduxUtils'

import { appUserLogout } from '../../app/actions'

import { surveyCreate, surveyDefsLoad, surveyDelete, surveyUpdate } from '../actions'

import { setSurveyDefsFetched } from '../surveyState'

const actionHandlers = {
  // reset state
  [appUserLogout]: () => ({}),

  [surveyCreate]: () => ({}),
  [surveyUpdate]: () => ({}),
  [surveyDelete]: () => ({}),

  [surveyDefsLoad]: (state, { draft }) => setSurveyDefsFetched(draft)(state),

}

export default exportReducer(actionHandlers)