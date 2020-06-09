import axios from 'axios'

import { LoaderActions } from '@webapp/store/ui'

import * as SurveyState from '../state'
import { SurveyStatusState } from '../status'
import { surveyDefsLoad, surveyDefsReset } from './actionTypes'

const _fetchDefs = (surveyId, defsType, params = {}) => axios.get(`/api/survey/${surveyId}/${defsType}`, { params })

export const initSurveyDefs = (draft = false, validate = false) => async (dispatch, getState) => {
  const state = getState()

  if (!SurveyStatusState.areDefsFetched(draft)(state)) {
    dispatch(LoaderActions.showLoader())

    const surveyId = SurveyState.getSurveyId(state)
    const params = { draft, validate, cycle: SurveyState.getSurveyCycleKey(state) }

    const [nodeDefsResp, categoriesResp, taxonomiesResp] = await Promise.all([
      _fetchDefs(surveyId, 'nodeDefs', params),
      _fetchDefs(surveyId, 'categories', params),
      _fetchDefs(surveyId, 'taxonomies', params),
    ])
    const { nodeDefs, nodeDefsValidation } = nodeDefsResp.data
    const { categories } = categoriesResp.data
    const { taxonomies } = taxonomiesResp.data

    dispatch({
      type: surveyDefsLoad,
      nodeDefs,
      nodeDefsValidation,
      categories,
      taxonomies,
      draft,
    })
    dispatch(LoaderActions.hideLoader())
  }
}

export const resetSurveyDefs = () => (dispatch) => dispatch({ type: surveyDefsReset })

export const reloadSurveyDefs = (draft = false, validate = false) => async (dispatch) => {
  await dispatch(resetSurveyDefs())
  await dispatch(initSurveyDefs(draft, validate))
}
