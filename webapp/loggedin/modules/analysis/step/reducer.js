import * as R from 'ramda'
import { exportReducer } from '@webapp/utils/reduxUtils'

import * as NodeDef from '@core/survey/nodeDef'
import * as StepState from '@webapp/loggedin/modules/analysis/step/state'

import { appUserLogout } from '@webapp/app/actions'
import { surveyCreate, surveyDelete, surveyUpdate } from '@webapp/survey/actions'
import { nodeDefSave } from '@webapp/survey/nodeDefs/actions'

import { chainReset, chainSave } from '@webapp/loggedin/modules/analysis/chain/actions'
import {
  stepReset,
  stepCreate,
  stepUpdate,
  stepPropsUpdate,
  stepDelete,
  stepDataLoad,
  calculationCreate,
  calculationIndexUpdate,
} from '@webapp/loggedin/modules/analysis/step/actions'
import {
  processingStepCalculationDelete,
  processingStepCalculationReset,
} from '@webapp/loggedin/modules/analysis/calculation/actions'

const actionHandlers = {
  // Reset state
  [appUserLogout]: () => ({}),
  [surveyCreate]: () => ({}),
  [surveyUpdate]: () => ({}),
  [surveyDelete]: () => ({}),

  // Chain
  [chainReset]: () => ({}),
  [chainSave]: (state, { step, calculation }) =>
    R.when(R.always(Boolean(step)), StepState.saveDirty(step, calculation))(state),

  // Step
  [stepReset]: () => ({}),

  [stepCreate]: (state, { processingStep }) => StepState.assocProcessingStep(processingStep)(state),

  [stepUpdate]: (state, { processingStep }) => StepState.assocProcessingStep(processingStep)(state),

  [stepPropsUpdate]: (state, { props }) => StepState.mergeProcessingStepProps(props)(state),

  [stepDelete]: () => ({}),

  [stepDataLoad]: (state, { calculations, stepPrevAttributeUuids }) =>
    StepState.assocStepData(calculations, stepPrevAttributeUuids)(state),

  // Calculations
  [calculationCreate]: (state, { calculation }) => StepState.assocCalculation(calculation)(state),

  [calculationIndexUpdate]: (state, { indexFrom, indexTo }) =>
    StepState.updateCalculationIndex(indexFrom, indexTo)(state),

  [processingStepCalculationDelete]: (state, { calculation }) => StepState.dissocCalculation(calculation)(state),

  [processingStepCalculationReset]: (state) => StepState.dissocTemporaryCalculation(state),

  // NodeDef (Virtual Entity)
  [nodeDefSave]: (state, { nodeDef }) =>
    R.when(R.always(NodeDef.isVirtual(nodeDef)), StepState.updateEntityUuid(NodeDef.getUuid(nodeDef)))(state),
}

export default exportReducer(actionHandlers)
