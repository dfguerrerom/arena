import { useDispatch } from 'react-redux'

import { DialogConfirmActions } from '@webapp/store/ui'

import { useReset } from './useReset'

export const useDismiss = ({
  chain,
  setChain,
  step,
  setStep,
  setDirty,
  calculation,
  calculationOriginal,
  setCalculation,
  calculationDirty,
  setCalculationDirty,
}) => {
  const dispatch = useDispatch()

  const reset = useReset({
    chain,
    setChain,
    step,
    setStep,
    setDirty,
    calculation,
    calculationOriginal,
    setCalculation,
    setCalculationDirty,
  })

  const resetCalculation = async () => {
    reset()
    setCalculation(null)
    setCalculationDirty(null)
  }

  return () => {
    ;(async () => {
      if (calculationDirty) {
        dispatch(
          DialogConfirmActions.showDialogConfirm({
            key: 'processingStepCalculation.deleteConfirm',
            onOk: resetCalculation,
          })
        )
      } else {
        await resetCalculation()
      }
    })()
  }
}
