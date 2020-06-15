import { useSelector } from 'react-redux'
import * as R from 'ramda'

import * as Survey from '@core/survey/survey'
import * as NodeDef from '@core/survey/nodeDef'
import * as Record from '@core/record/record'
import * as Node from '@core/record/node'
import * as RecordValidation from '@core/record/recordValidation'
import * as Validation from '@core/validation/validation'

import { useSurvey } from '@webapp/store/survey'

import * as RecordState from '@webapp/loggedin/surveyViews/record/recordState'

export default (props) => {
  const { edit, node, nodeDef, nodes, parentNode } = props

  if (edit) {
    const survey = useSurvey()
    return Survey.getNodeDefValidation(nodeDef)(survey)
  }
  const record = useSelector(RecordState.getRecord)
  const recordValidation = Record.getValidation(record)

  if (NodeDef.isMultiple(nodeDef)) {
    // Showing validation for a single node instance of multiple nodeDef
    if (node) {
      return RecordValidation.getNodeValidation(node)(recordValidation)
    }
    if (NodeDef.isEntity(nodeDef)) {
      // Only entities can have children with min/max count validation
      return RecordValidation.getValidationChildrenCount(
        Node.getUuid(parentNode),
        NodeDef.getUuid(nodeDef)
      )(recordValidation)
    }
    if (!R.all(Validation.isValid)(nodes)) {
      return Validation.newInstance(false, {}, [{ key: Validation.messageKeys.record.oneOrMoreInvalidValues }])
    }
  } else if (!R.isEmpty(nodes)) {
    return RecordValidation.getNodeValidation(nodes[0])(recordValidation)
  }

  return Validation.newInstance()
}
