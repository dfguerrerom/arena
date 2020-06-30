import { useDispatch } from 'react-redux'

import { DialogConfirmActions } from '@webapp/store/ui'
import { AnalysisActions } from '@webapp/service/storage'

import { useReset } from './useReset'

export const useDismiss = ({ chain, setChain, step, setStep, setDirty, originalStep, stepDirty, setStepDirty }) => {
  const dispatch = useDispatch()

  const reset = useReset({
    chain,
    setChain,
    step,
    setStep,
    setDirty,
    originalStep,
    setStepDirty,
  })

  const resetStep = async () => {
    reset()
    AnalysisActions.resetStep()
    setStep({})
    setStepDirty(false)
  }

  return () => {
    ;(async () => {
      if (stepDirty) {
        dispatch(
          DialogConfirmActions.showDialogConfirm({
            key: 'processingStepCalculation.deleteConfirm',
            onOk: resetStep,
          })
        )
      } else {
        await resetStep()
      }
    })()
  }
}
