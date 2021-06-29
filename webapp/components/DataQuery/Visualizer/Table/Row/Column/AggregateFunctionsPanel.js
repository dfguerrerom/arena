import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import * as NodeDef from '@core/survey/nodeDef'
import { Query } from '@common/model/query'

import PanelRight from '@webapp/components/PanelRight'
import { useI18n, useLang } from '@webapp/store/system'

import { CustomAggregateFunctionsEditor } from './CustomAggregateFunctionsEditor'

export const AggregateFunctionsPanel = (props) => {
  const { aggregateFunctions, nodeDef, onChangeQuery, onClose, query } = props

  const lang = useLang()
  const i18n = useI18n()

  const customAggregateFunctionUuids = aggregateFunctions.filter(
    (fn) => !Object.values(Query.DEFAULT_AGGREGATE_FUNCTIONS).includes(fn)
  )

  const nodeDefUuid = NodeDef.getUuid(nodeDef)
  const nodeDefLabel = NodeDef.getLabel(nodeDef, lang)

  return (
    <PanelRight
      width="700px"
      header={`${nodeDefLabel} ${i18n.t('common.aggregateFunction', { count: 2 })}`}
      onClose={onClose}
    >
      {Object.keys(Query.DEFAULT_AGGREGATE_FUNCTIONS).map((aggregateFn) => (
        <button
          key={aggregateFn}
          type="button"
          className={classNames('btn btn-aggregate-fn deselectable', {
            active: aggregateFunctions.indexOf(aggregateFn) >= 0,
          })}
          onClick={() => onChangeQuery(Query.toggleMeasureAggregateFunction({ nodeDefUuid, aggregateFn })(query))}
        >
          {i18n.t(`common.${aggregateFn}`)}
        </button>
      ))}
      <CustomAggregateFunctionsEditor
        nodeDef={nodeDef}
        selectedUuids={customAggregateFunctionUuids}
        onSelectionChange={(selectedAggregateFunctionsByUuid) => {
          Object.keys(selectedAggregateFunctionsByUuid).forEach((uuid) =>
            onChangeQuery(Query.toggleMeasureAggregateFunction({ nodeDefUuid, aggregateFn: uuid })(query))
          )
        }}
      />
    </PanelRight>
  )
}

AggregateFunctionsPanel.propTypes = {
  aggregateFunctions: PropTypes.array.isRequired,
  nodeDef: PropTypes.object.isRequired,
  onChangeQuery: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  query: PropTypes.object.isRequired,
}