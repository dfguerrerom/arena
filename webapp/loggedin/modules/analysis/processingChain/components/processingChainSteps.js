import './processingChainSteps.scss'

import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import * as R from 'ramda'

import * as ProcessingChain from '@common/analysis/processingChain'
import * as ProcessingStep from '@common/analysis/processingStep'

import { useI18n } from '@webapp/commonComponents/hooks'
import ValidationTooltip from '@webapp/commonComponents/validationTooltip'
import ProcessingChainStep from '@webapp/loggedin/modules/analysis/processingChain/components/processingChainStep'

import * as ProcessingStepState from '@webapp/loggedin/modules/analysis/processingStep/processingStepState'

import { fetchProcessingSteps } from '@webapp/loggedin/modules/analysis/processingChain/actions'
import { createProcessingStep } from '@webapp/loggedin/modules/analysis/processingStep/actions'
import ProcessingStepView from '@webapp/loggedin/modules/analysis/processingStep/processingStepView'

const ProcessingChainSteps = (props) => {
  const { processingChain, validation } = props

  const i18n = useI18n()
  const editingStep = useSelector(ProcessingStepState.isEditingStep)
  const dispatch = useDispatch()

  // Fetch steps on mount
  useEffect(() => {
    if (!ProcessingChain.isTemporary(processingChain) && !editingStep) {
      dispatch(fetchProcessingSteps(ProcessingChain.getUuid(processingChain)))
    }
  }, [])

  const processingSteps = ProcessingChain.getProcessingSteps(processingChain)
  const lastStepHasCategory = R.pipe(R.last, ProcessingStep.hasCategory)(processingSteps)

  return (
    <div className={`form-item${editingStep ? ' processing-chain__steps-editing-step' : ''}`}>
      {!editingStep && (
        <div className="form-label processing-chain__steps-label">
          <ValidationTooltip validation={validation}>{i18n.t('processingChainView.processingSteps')}</ValidationTooltip>
          <button
            type="button"
            className="btn-s btn-transparent"
            onClick={() => dispatch(createProcessingStep())}
            aria-disabled={lastStepHasCategory}
          >
            <span className="icon icon-plus icon-14px" />
          </button>
        </div>
      )}

      <div className="processing-chain__steps">
        {processingSteps.map((processingStep) => (
          <ProcessingChainStep
            key={ProcessingStep.getIndex(processingStep)}
            processingStep={processingStep}
            validation={ProcessingChain.getItemValidationByUuid(ProcessingStep.getUuid(processingStep))(
              processingChain
            )}
          />
        ))}
      </div>

      {editingStep && <ProcessingStepView />}
    </div>
  )
}

ProcessingChainSteps.propTypes = {
  processingChain: PropTypes.object.isRequired,
  validation: PropTypes.object.isRequired,
}

export default ProcessingChainSteps
