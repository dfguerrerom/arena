import React from 'react'
import * as PropTypes from 'prop-types'

import * as Survey from '@core/survey/survey'
import * as NodeDef from '@core/survey/nodeDef'

import { useSurvey } from '@webapp/commonComponents/hooks'
import AttributeSelector from './attributeSelector'

const AttributesSelector = (props) => {
  const {
    canSelectAttributes,
    filterTypes,
    lang,
    nodeDefUuidEntity,
    nodeDefUuidsAttributes,
    onToggleAttribute,
    showAncestors,
    showMultipleAttributes,
  } = props

  const survey = useSurvey()
  const nodeDefContext = Survey.getNodeDefByUuid(nodeDefUuidEntity)(survey)
  const nodeDefParent = Survey.getNodeDefParent(nodeDefContext)(survey)

  let childDefs = []
  if (nodeDefContext) {
    childDefs = NodeDef.isEntity(nodeDefContext)
      ? Survey.getNodeDefChildren(nodeDefContext, true)(survey)
      : [nodeDefContext] // Multiple attribute
  }

  return (
    childDefs && (
      <>
        {childDefs.map((childDef) => (
          <AttributeSelector
            key={NodeDef.getUuid(childDef)}
            canSelectAttributes={canSelectAttributes}
            filterTypes={filterTypes}
            lang={lang}
            nodeDef={childDef}
            nodeDefUuidsAttributes={nodeDefUuidsAttributes}
            nodeDefContext={nodeDefContext}
            onToggleAttribute={onToggleAttribute}
            showMultipleAttributes={showMultipleAttributes}
          />
        ))}

        {showAncestors && nodeDefParent && (
          <>
            <div className="node-def-label">{NodeDef.getLabel(nodeDefParent, lang)}</div>
            <AttributesSelector
              lang={lang}
              nodeDefUuidEntity={NodeDef.getUuid(nodeDefParent)}
              nodeDefUuidsAttributes={nodeDefUuidsAttributes}
              onToggleAttribute={onToggleAttribute}
              filterTypes={filterTypes}
              canSelectAttributes={canSelectAttributes}
              showMultipleAttributes={showMultipleAttributes}
            />
          </>
        )}
      </>
    )
  )
}

AttributesSelector.propTypes = {
  canSelectAttributes: PropTypes.bool,
  filterTypes: PropTypes.array,
  lang: PropTypes.string.isRequired,
  nodeDefUuidEntity: PropTypes.string,
  nodeDefUuidsAttributes: PropTypes.array,
  onToggleAttribute: PropTypes.func.isRequired,
  showAncestors: PropTypes.bool,
  showMultipleAttributes: PropTypes.bool,
}

AttributesSelector.defaultProps = {
  canSelectAttributes: true,
  filterTypes: [],
  nodeDefUuidEntity: null,
  nodeDefUuidsAttributes: [],
  showAncestors: true,
  showMultipleAttributes: true,
}

export default AttributesSelector
