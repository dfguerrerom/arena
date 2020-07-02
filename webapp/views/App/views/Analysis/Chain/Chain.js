import './chainView.scss'
import './chainList.scss'
import './chainListItem.scss'
import './chainForm.scss'

import React from 'react'
import { matchPath } from 'react-router'

import * as Validation from '@core/validation/validation'
import * as Survey from '@core/survey/survey'

import * as Chain from '@common/analysis/processingChain'

import { appModuleUri, analysisModules } from '@webapp/app/appModules'
import { AnalysisActions } from '@webapp/service/storage'
import LabelsEditor from '@webapp/components/survey/LabelsEditor'
import CyclesSelector from '@webapp/components/survey/CyclesSelector'
import ButtonRStudio from '@webapp/components/ButtonRStudio'

import { useSurveyInfo } from '@webapp/store/survey'
import { useHistoryListen } from '@webapp/components/hooks'

import { useAnalysis } from './store'

import StepList from './StepList'
import Step from './Step'
import ButtonBar from './ButtonBar'

const ChainComponent = () => {
  const analysis = useAnalysis()
  const { chain, step, stepDirty, calculation, calculationDirty, dirty, editingStep, Actions } = analysis
  const validation = Chain.getValidation(chain)
  const surveyInfo = useSurveyInfo()

  useHistoryListen(
    (location) => {
      if (matchPath(location.pathname, { path: `${appModuleUri(analysisModules.nodeDef)}:uuid/` })) {
        AnalysisActions.persist(analysis)
      }
    },
    [chain, step, stepDirty, calculation, calculationDirty]
  )

  return (
    <div className={`chain ${editingStep ? 'show-step' : ''}`}>
      <ButtonRStudio onClick={Actions.openRStudio} disabled={Survey.isDraft(surveyInfo) || dirty} />

      <div className="form">
        <LabelsEditor
          labels={Chain.getLabels(chain)}
          formLabelKey="processingChainView.formLabel"
          readOnly={editingStep}
          validation={Validation.getFieldValidation(Chain.keysProps.labels)(validation)}
          onChange={(labels) => Actions.chain.update({ name: Chain.keysProps.labels, value: labels })}
        />

        {!editingStep && (
          <>
            <LabelsEditor
              formLabelKey="common.description"
              labels={Chain.getDescriptions(chain)}
              onChange={(descriptions) =>
                Actions.chain.update({ name: Chain.keysProps.descriptions, value: descriptions })
              }
            />

            <CyclesSelector
              cyclesKeysSelected={Chain.getCycles(chain)}
              onChange={(cycles) => Actions.chain.updateCycles({ cycles })}
            />
          </>
        )}

        <StepList analysis={analysis} />
      </div>

      <Step analysis={analysis} />

      <ButtonBar analysis={analysis} />
    </div>
  )
}

export default ChainComponent
