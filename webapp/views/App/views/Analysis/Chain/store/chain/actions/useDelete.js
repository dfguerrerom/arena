import axios from 'axios'
import { useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router'

import { DialogConfirmActions } from '@webapp/store/ui'
import { SurveyActions, useSurveyId } from '@webapp/store/survey'

import { AnalysisActions } from '@webapp/service/storage'

import * as Chain from '@common/analysis/processingChain'

import { analysisModules, appModuleUri } from '@webapp/app/appModules'

export const useDelete = ({ chain }) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const surveyId = useSurveyId()
  const { chainUuid } = useParams()

  const resetChain = async () => {
    AnalysisActions.resetAnalysis()

    if (chainUuid) {
      await axios.delete(`/api/survey/${surveyId}/processing-chain/${Chain.getUuid(chain)}`)
      dispatch(SurveyActions.surveyChainElementDelete())
    }

    history.push(appModuleUri(analysisModules.processingChains))
  }

  return () => {
    ;(async () => {
      if (chain) {
        dispatch(
          DialogConfirmActions.showDialogConfirm({
            key: 'processingChainView.deleteConfirm',
            onOk: resetChain,
          })
        )
      } else {
        await resetChain()
      }
    })()
  }
}
