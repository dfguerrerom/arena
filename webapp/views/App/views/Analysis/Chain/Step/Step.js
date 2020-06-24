import './Step.scss'
import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { useHistory } from 'react-router'

import * as Category from '@core/survey/category'
import * as Validation from '@core/validation/validation'

import { analysisModules, appModuleUri } from '@webapp/app/appModules'

import * as Chain from '@common/analysis/processingChain'
import * as Step from '@common/analysis/processingStep'
import * as ChainValidator from '@common/analysis/processingChainValidator'

import { useI18n } from '@webapp/store/system'

import CategorySelector from '@webapp/components/survey/CategorySelector'

import CalculationView from '@webapp/loggedin/modules/analysis/calculation/view'
import { useAddEntityVirtual } from '../store/hooks'
import EntitySelector from './EntitySelector'
import CalculationList from './CalculationList'

const getClassName = ({ editingStep, editingCalculation }) => {
  let className = 'step chain-form'
  if (editingStep) className += ' show'
  if (editingCalculation) className += ' show-calculation'
  return className
}

const StepComponent = ({ analysisState, analysisActions }) => {
  const { chain, step, calculation, editingStep, editingCalculation } = analysisState
  const { step: stepActions } = analysisActions
  const history = useHistory()
  const i18n = useI18n()
  const addEntityVirtual = useAddEntityVirtual()

  const stepNext = Chain.getStepNext(step)(chain)

  const validation = Chain.getItemValidationByUuid(Step.getUuid(step))(chain)
  const hasCalculationSteps = (Step.getCalculationsCount(step) || []).length > 0
  const disabledEntityOrCategory = hasCalculationSteps || editingCalculation || Boolean(stepNext)
  const entityUuid = Step.getEntityUuid(step)

  /* useOnUpdate(() => {
    // Validate step on calculation editor close (calculations may have been added / deleted)
    if (!editingCalculation) {
      dispatch(validateStep())
    }
  }, [editingCalculation]) */

  const className = useMemo(() => getClassName({ editingStep, editingCalculation }), [editingStep, editingCalculation])

  return (
    <div className={className}>
      <div className="form">
        {!editingCalculation && (
          <>
            <button type="button" className="btn-s btn-close" onClick={stepActions.delete}>
              <span className="icon icon-10px icon-cross" />
            </button>

            <EntitySelector
              analysisActions={analysisActions}
              analysisState={analysisState}
              validation={Validation.getFieldValidation(ChainValidator.keys.entityOrCategory)(validation)}
              onChange={(entityUuidUpdate) => {
                stepActions.update({
                  [Step.keysProps.entityUuid]: entityUuidUpdate,
                  [Step.keysProps.categoryUuid]: null,
                })
              }}
              readOnly={disabledEntityOrCategory}
            >
              <button
                type="button"
                className="btn btn-s btn-edit"
                onClick={() => history.push(`${appModuleUri(analysisModules.nodeDef)}${entityUuid}/`)}
                aria-disabled={!entityUuid}
              >
                <span className="icon icon-pencil2 icon-12px icon-left" />
                {i18n.t('common.edit')}
              </button>
              <button
                type="button"
                className="btn btn-s btn-add"
                onClick={addEntityVirtual}
                aria-disabled={hasCalculationSteps}
              >
                <span className="icon icon-plus icon-12px icon-left" />
                {i18n.t('processingStepView.virtualEntity')}
              </button>
            </EntitySelector>

            <div className="form-item processing-step__category-selector-form-item">
              <div className="form-label chain-list__label">{i18n.t('nodeDefEdit.codeProps.category')}</div>
              <CategorySelector
                disabled={disabledEntityOrCategory}
                categoryUuid={Step.getCategoryUuid(step)}
                validation={Validation.getFieldValidation(ChainValidator.keys.entityOrCategory)(validation)}
                showManage={false}
                showAdd={false}
                onChange={(category) => {
                  stepActions.update({
                    [Step.keysProps.entityUuid]: null,
                    [Step.keysProps.categoryUuid]: Category.getUuid(category),
                  })
                }}
              />
            </div>
          </>
        )}
        <CalculationList analysisState={analysisState} analysisActions={analysisActions} />
      </div>

      <CalculationView analysisState={analysisState} analysisActions={analysisActions} />
      <p>{JSON.stringify(calculation)}</p>
    </div>
  )
}

StepComponent.propTypes = {
  analysisState: PropTypes.object.isRequired,
  analysisActions: PropTypes.object.isRequired,
}

export default StepComponent
