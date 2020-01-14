import { exportReducer } from '@webapp/utils/reduxUtils'

import * as ProcessingChainState from '@webapp/loggedin/modules/analysis/processingChain/processingChainState'

import { appUserLogout } from '@webapp/app/actions'

import { surveyCreate, surveyDelete, surveyUpdate } from '@webapp/survey/actions'
import {
  processingChainUpdate,
  processingChainPropUpdate,
  processingChainStepsLoad,
  processingChainSave,
} from './actions'

const actionHandlers = {
  // Reset state
  [appUserLogout]: () => ({}),
  [surveyCreate]: () => ({}),
  [surveyUpdate]: () => ({}),
  [surveyDelete]: () => ({}),

  // Chain
  [processingChainUpdate]: (state, { processingChain }) =>
    ProcessingChainState.assocProcessingChain(processingChain)(state),

  [processingChainPropUpdate]: (state, { key, value }) => ProcessingChainState.assocPropDirty(key, value)(state),

  [processingChainSave]: state => ProcessingChainState.mergeDirty(state),

  // Steps
  [processingChainStepsLoad]: (state, { processingSteps }) =>
    ProcessingChainState.assocProcessingSteps(processingSteps)(state),
}

export default exportReducer(actionHandlers)
