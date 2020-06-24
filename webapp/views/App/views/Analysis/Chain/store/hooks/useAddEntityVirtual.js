import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router'

import * as NodeDef from '@core/survey/nodeDef'
import * as Survey from '@core/survey/survey'

import { analysisModules, appModuleUri } from '@webapp/app/appModules'

import { NodeDefsActions, useSurveyInfo } from '@webapp/store/survey'

export const useAddEntityVirtual = () => {
  const surveyInfo = useSurveyInfo()
  const dispatch = useDispatch()
  const history = useHistory()

  return () => {
    ;(async () => {
      const nodeDef = NodeDef.newNodeDef(
        null,
        NodeDef.nodeDefType.entity,
        Survey.getCycleKeys(surveyInfo),
        { [NodeDef.propKeys.multiple]: true },
        {},
        true,
        true
      )
      await dispatch({ type: NodeDefsActions.nodeDefCreate, nodeDef })
      history.push(`${appModuleUri(analysisModules.nodeDef)}${NodeDef.getUuid(nodeDef)}/`)
    })()
  }
}
