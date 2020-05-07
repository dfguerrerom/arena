import './stepView.scss'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router'
import * as R from 'ramda'

import * as Category from '@core/survey/category'
import * as Validation from '@core/validation/validation'
import * as Chain from '@common/analysis/processingChain'
import * as Step from '@common/analysis/processingStep'
import * as ChainValidator from '@common/analysis/processingChainValidator'

import { useI18n, useOnUpdate } from '@webapp/commonComponents/hooks'
import ProcessingStepCalculationEditor from '@webapp/loggedin/modules/analysis/processingStepCalculation/processingStepCalculationEditor'
import CategorySelector from '@webapp/loggedin/surveyViews/categorySelector/categorySelector'

import * as ChainState from '@webapp/loggedin/modules/analysis/chain/state'
import * as StepState from '@webapp/loggedin/modules/analysis/step/state'
import * as CalculationState from '@webapp/loggedin/modules/analysis/processingStepCalculation/processingStepCalculationState'

import { showDialogConfirm } from '@webapp/app/appDialogConfirm/actions'
import {
  fetchStepData,
  resetStep,
  updateStepProps,
  addEntityVirtual,
  validateStep,
} from '@webapp/loggedin/modules/analysis/step/actions'
import { navigateToNodeDefEdit } from '@webapp/loggedin/modules/analysis/chain/actions'

import EntitySelector from './components/entitySelector'
import CalculationList from './components/calculationList'

const StepView = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const i18n = useI18n()
  const chain = useSelector(ChainState.getProcessingChain)
  const step = useSelector(StepState.getProcessingStep)
  const stepPrev = useSelector(StepState.getProcessingStepPrev)
  const stepNext = useSelector(StepState.getProcessingStepNext)
  const dirty = useSelector(StepState.isDirty)
  const editingCalculation = useSelector(CalculationState.isEditingCalculation)

  const validation = Chain.getItemValidationByUuid(Step.getUuid(step))(chain)
  const hasCalculationSteps = R.pipe(Step.getCalculationsCount, (cnt) => cnt > 0)(step)
  const disabledEntityOrCategory = hasCalculationSteps || editingCalculation || Boolean(stepNext)
  const entityUuid = Step.getEntityUuid(step)

  useEffect(() => {
    if (!editingCalculation) {
      dispatch(fetchStepData())
    }
  }, [Step.getUuid(step)])

  useOnUpdate(() => {
    // Validate step on calculation editor close (calculations may have been added / deleted)
    if (!editingCalculation) {
      dispatch(validateStep())
    }
  }, [editingCalculation])

  return (
    <div className={`processing-step${editingCalculation ? ' calculation-editor-opened' : ''}`}>
      <div className="form">
        {!editingCalculation && (
          <>
            <button
              type="button"
              className="btn-s btn-close"
              onClick={() => {
                if (dirty) dispatch(showDialogConfirm('common.cancelConfirm', {}, resetStep()))
                else dispatch(resetStep())
              }}
            >
              <span className="icon icon-10px icon-cross" />
            </button>

            <EntitySelector
              step={step}
              stepPrev={stepPrev}
              validation={Validation.getFieldValidation(ChainValidator.keys.entityOrCategory)(validation)}
              onChange={(entityUuidUpdate) => {
                dispatch(
                  updateStepProps({
                    [Step.keysProps.entityUuid]: entityUuidUpdate,
                    [Step.keysProps.categoryUuid]: null,
                  })
                )
              }}
              readOnly={disabledEntityOrCategory}
            >
              <button
                type="button"
                className="btn btn-s btn-edit"
                onClick={() => {
                  dispatch(navigateToNodeDefEdit(history, entityUuid))
                }}
                aria-disabled={!entityUuid}
              >
                <span className="icon icon-pencil2 icon-12px icon-left" />
                {i18n.t('common.edit')}
              </button>
              <button
                type="button"
                className="btn btn-s btn-add"
                onClick={() => {
                  dispatch(addEntityVirtual(history))
                }}
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
                  dispatch(
                    updateStepProps({
                      [Step.keysProps.entityUuid]: null,
                      [Step.keysProps.categoryUuid]: Category.getUuid(category),
                    })
                  )
                }}
              />
            </div>
          </>
        )}
        <CalculationList
          calculationEditorOpened={editingCalculation}
          validation={Validation.getFieldValidation(Step.keys.calculations)(validation)}
        />
      </div>

      <ProcessingStepCalculationEditor />
    </div>
  )
}

export default StepView
