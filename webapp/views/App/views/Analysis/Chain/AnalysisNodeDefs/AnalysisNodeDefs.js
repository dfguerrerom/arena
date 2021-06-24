import './AnalysisNodeDefs.scss'
import React, { useRef, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import * as NodeDef from '@core/survey/nodeDef'
import * as Survey from '@core/survey/survey'
import { ChainActions, useChainEntityDefUuid, useChain } from '@webapp/store/ui/chain'
import { useSurvey } from '@webapp/store/survey'
import { useI18n } from '@webapp/store/system'

import { EntitySelectorTree } from '@webapp/components/survey/NodeDefsSelector'

import { AnalysisNodeDefsHeader } from './AnalysisNodeDefsHeader'
import { AnalysisNodeDef } from './AnalysisNodeDef'
import { useSortAnalysisNodeDefs } from './hooks'

const AnalysisNodeDefs = () => {
  const dispatch = useDispatch()
  const i18n = useI18n()
  const entityDefUuid = useChainEntityDefUuid()

  const chain = useChain()
  const survey = useSurvey()

  const analysisNodeDefsRef = useRef(null)

  const selectEntity = (entityDef) => dispatch(ChainActions.updateEntityDefUuid(entityDef.uuid))
  const getLabelSuffix = (entityDef) => {
    const count = Survey.getAnalysisNodeDefs({ entity: entityDef, chain })(survey).length
    return count ? ` (${count})` : ''
  }

  const _analysisNodeDefsToShow = useMemo(
    () => Survey.getAnalysisNodeDefs({ chain, entityDefUuid })(survey),
    [chain, survey, entityDefUuid]
  )

  useSortAnalysisNodeDefs({ analysisNodeDefsRef, analysisNodeDefs: _analysisNodeDefsToShow })

  return (
    <div className="analysis-node-defs-wrapper">
      <EntitySelectorTree getLabelSuffix={getLabelSuffix} nodeDefUuidActive={entityDefUuid} onSelect={selectEntity} />

      {entityDefUuid && (
        <div className="analysis-node-defs" ref={analysisNodeDefsRef}>
          <AnalysisNodeDefsHeader />

          {_analysisNodeDefsToShow.length > 0 && (
            <div className="analysis-node-def__list-header">
              <div />
              <div>{i18n.t('common.name')}</div>
              <div>{i18n.t('common.label')}</div>
              <div>{i18n.t('common.type')}</div>
              <div>{i18n.t('common.active')}</div>
              <div />
            </div>
          )}

          {_analysisNodeDefsToShow.map((analysisNodeDef) => (
            <AnalysisNodeDef key={NodeDef.getUuid(analysisNodeDef)} nodeDefUuid={NodeDef.getUuid(analysisNodeDef)} />
          ))}
        </div>
      )}
    </div>
  )
}

export { AnalysisNodeDefs }