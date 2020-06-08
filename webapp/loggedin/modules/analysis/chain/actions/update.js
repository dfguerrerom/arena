import * as Survey from '@core/survey/survey'
import * as NodeDef from '@core/survey/nodeDef'
import * as Chain from '@common/analysis/processingChain'
import * as Step from '@common/analysis/processingStep'
import * as Calculation from '@common/analysis/processingStepCalculation'

import { SurveyState } from '@webapp/store/survey'

import * as ChainState from '@webapp/loggedin/modules/analysis/chain/state'

import { NotificationActions } from '@webapp/store/ui'
import { validateChain } from './validation'

export const chainPropUpdate = 'analysis/chain/prop/update'

const _onChainPropUpdate = (key, value) => async (dispatch) => {
  await dispatch({ type: chainPropUpdate, key, value })
  dispatch(validateChain())
}

export const updateChainProp = (key, value) => (dispatch) => dispatch(_onChainPropUpdate(key, value))

export const updateChainCycles = (cycles) => (dispatch, getState) => {
  const state = getState()

  const survey = SurveyState.getSurvey(state)
  const chain = ChainState.getProcessingChain(state)

  const nodeDefsBelongToCycles = (nodeDefUuids) =>
    Survey.getNodeDefsByUuids(nodeDefUuids)(survey).every(NodeDef.belongsToAllCycles(cycles))

  // Check that all step entity defs belong to the specified cycles
  const steps = Chain.getProcessingSteps(chain)
  const allStepEntitiesBelongToCycles = nodeDefsBelongToCycles(steps.map(Step.getEntityUuid))

  // Check that all step calculation attribute defs belong to the specified cycles
  const allStepCalculationAttriutesBelongToCycles = nodeDefsBelongToCycles(
    steps.flatMap((step) => Step.getCalculations(step).map(Calculation.getNodeDefUuid))
  )

  if (allStepEntitiesBelongToCycles && allStepCalculationAttriutesBelongToCycles) {
    dispatch(_onChainPropUpdate(Chain.keysProps.cycles, cycles))
  } else {
    dispatch(NotificationActions.notifyError({ key: 'processingChainView.cannotSelectCycle' }))
  }
}
