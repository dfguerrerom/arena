import { useCallback } from 'react'
import axios from 'axios'
import { useParams } from 'react-router'
import { useDispatch } from 'react-redux'

import * as A from '@core/arena'

import { DialogConfirmActions, NotificationActions } from '@webapp/store/ui'
import { SurveyActions, useSurveyId } from '@webapp/store/survey'

import * as Step from '@common/analysis/processingStep'
import * as Calculation from '@common/analysis/processingStepCalculation'
import * as ChainController from '@common/analysis/processingChainController'

import { State } from '../../state'

export const useDelete = ({ setState }) => {
  const dispatch = useDispatch()
  const surveyId = useSurveyId()
  const { chainUuid } = useParams()

  const deleteCalculation = ({ state }) => async () => {
    const chain = State.getChainEdit(state)
    const step = State.getStepEdit(state)
    const calculation = State.getCalculationEdit(state)
    const calculationUuid = Calculation.getUuid(calculation)

    if (chainUuid && !Calculation.isTemporary(calculation)) {
      await axios.delete(`/api/survey/${surveyId}/processing-step/${Step.getUuid(step)}/calculation/${calculationUuid}`)
      dispatch(SurveyActions.chainItemDelete())
    }

    const { chain: chainEditUpdated, step: stepEditUpdated } = ChainController.deleteCalculation({
      chain,
      step,
      calculation,
    })

    setState(
      A.pipe(
        State.assocChain(chainEditUpdated),
        State.assocChainEdit(chainEditUpdated),
        State.assocStep(stepEditUpdated),
        State.assocStepEdit(stepEditUpdated),
        State.dissocCalculation,
        State.dissocCalculationEdit
      )(state)
    )

    dispatch(NotificationActions.notifyInfo({ key: 'processingStepCalculation.deleteComplete' }))
  }

  return useCallback(async ({ state }) => {
    const stepDirty = State.isStepDirty(state)
    if (stepDirty) {
      dispatch(
        DialogConfirmActions.showDialogConfirm({
          key: 'processingStepView.deleteConfirm',
          onOk: deleteCalculation({ state }),
        })
      )
    } else {
      await deleteCalculation({ state })()
    }
  }, [])
}
